import { NextResponse } from "next/server";
import { validateUpload, DEFAULT_MAX_SIZE, defaultExtAllowlist, defaultMimeAllowlist } from "~/lib/uploads";
import { avScan } from "~/lib/avscan";
import { log } from "~/lib/logger";
import { recordMetric } from "~/lib/metrics";
import { writeAuditLog } from "~/lib/audit";

// This route demonstrates secure file upload validation.
// Clients should POST multipart/form-data with a single field named "file".

export const runtime = "nodejs"; // Using Buffer; Edge runtime does not support Buffer

// Per-route size limit (bytes). Defaults to 10MB if not provided.
const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES ?? DEFAULT_MAX_SIZE);

export async function POST(req: Request) {
  const started = performance.now();
  try {
    // --- Upload quotas / abuse controls (per-IP, hourly window) ---
    try {
      const xff = req.headers.get('x-forwarded-for') ?? ''
      const xri = req.headers.get('x-real-ip') ?? ''
      const ip = (xff.split(',')[0]?.trim() ?? xri ?? 'unknown')
      const UPLOAD_LIMIT_PER_HOUR = Number(process.env.UPLOAD_MAX_PER_HOUR ?? '100')

      const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
      if (hasUpstash) {
        const { Redis } = await import('@upstash/redis')
        const redis = Redis.fromEnv()
        const key = `upload:ip:${ip}:${new Date().toISOString().slice(0,13)}` // hourly key YYYY-MM-DDTHH
        const count = await redis.incr(key)
        if (count === 1) {
          // set expiry to slightly over an hour
          await redis.expire(key, 60 * 60 + 30)
        }
        const remaining = Math.max(UPLOAD_LIMIT_PER_HOUR - count, 0)
        // Attach rate headers via a shallow NextResponse at the end of handling. For early return, include headers directly.
        if (count > UPLOAD_LIMIT_PER_HOUR) {
          void writeAuditLog({ event: 'upload.quota_exceeded', action: 'upload', resource: '/api/uploads', allowed: false, ip, metadata: { limit: UPLOAD_LIMIT_PER_HOUR, count } })
          const headers = { 'X-Upload-Limit': String(UPLOAD_LIMIT_PER_HOUR), 'X-Upload-Remaining': '0' }
          return NextResponse.json({ error: 'Upload quota exceeded' }, { status: 429, headers })
        }
        // attach to req as header-like via setting a symbol for later propagation
        req.headers.set('x-upload-limit', String(UPLOAD_LIMIT_PER_HOUR))
        req.headers.set('x-upload-remaining', String(remaining))
      } else {
        // in-memory fallback (best-effort, not persisted across instances)
        type RateRec = { count: number; resetAt: number }
        const g = globalThis as typeof globalThis & { __uploadRateStore?: Map<string, RateRec> }
        g.__uploadRateStore ??= new Map()
        const hourKey = new Date().toISOString().slice(0,13)
        const key = `upload:ip:${ip}:${hourKey}`
        const now = Date.now()
        const rec = g.__uploadRateStore.get(key)
        if (!rec || now > rec.resetAt) {
          g.__uploadRateStore.set(key, { count: 1, resetAt: now + 60 * 60 * 1000 })
        } else {
          rec.count += 1
          g.__uploadRateStore.set(key, rec)
          if (rec.count > UPLOAD_LIMIT_PER_HOUR) {
            void writeAuditLog({ event: 'upload.quota_exceeded', action: 'upload', resource: '/api/uploads', allowed: false, ip, metadata: { limit: UPLOAD_LIMIT_PER_HOUR, count: rec.count } })
            const headers = { 'X-Upload-Limit': String(UPLOAD_LIMIT_PER_HOUR), 'X-Upload-Remaining': '0' }
            return NextResponse.json({ error: 'Upload quota exceeded' }, { status: 429, headers })
          }
          const remaining = Math.max(UPLOAD_LIMIT_PER_HOUR - rec.count, 0)
          req.headers.set('x-upload-limit', String(UPLOAD_LIMIT_PER_HOUR))
          req.headers.set('x-upload-remaining', String(remaining))
        }
      }
    } catch (quotaErr) {
      // Do not block the upload flow if quota subsystem errors; log and continue
      log.warn('Upload quota check errored', { error: (quotaErr as Error).message })
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      const res = NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
      const duration = Math.round(performance.now() - started);
      log.warn("Upload: wrong content-type", { duration, contentType });
      recordMetric("upload_request_invalid", 1);
      void writeAuditLog({
        event: "upload.invalid_content_type",
        action: "upload",
        resource: "/api/uploads",
        allowed: false,
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
        metadata: { contentType },
      });
      return res;
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      const res = NextResponse.json({ error: "Missing file field" }, { status: 400 });
      const duration = Math.round(performance.now() - started);
      log.warn("Upload: missing file", { duration });
      recordMetric("upload_request_missing_file", 1);
      void writeAuditLog({
        event: "upload.missing_file",
        action: "upload",
        resource: "/api/uploads",
        allowed: false,
      });
      return res;
    }

    // Early size guard using File.size before reading the buffer
    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      const res = NextResponse.json({ error: `File too large. Max ${MAX_BYTES} bytes` }, { status: 400 });
      const duration = Math.round(performance.now() - started);
      log.warn("Upload: file too large", { duration, size: file.size, max: MAX_BYTES });
      recordMetric("upload_rejected_size", 1);
      void writeAuditLog({
        event: "upload.too_large",
        action: "upload",
        resource: "/api/uploads",
        allowed: false,
        metadata: { size: file.size, max: MAX_BYTES },
      });
      return res;
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Final validation using helper (extension, MIME, optional AV scan)
    const result = await validateUpload(
      {
        buffer,
        filename: file.name ?? "upload.bin",
        mimetype: file.type ?? null,
        size: file.size ?? buffer.length,
      },
      {
        maxBytes: MAX_BYTES,
        // Restrict to allowlisted types; override via env if needed
        allowedExt: (process.env.UPLOAD_ALLOWED_EXT ?? defaultExtAllowlist.join(",")).split(",").map((s) => s.trim()).filter(Boolean),
        allowedMime: (process.env.UPLOAD_ALLOWED_MIME ?? defaultMimeAllowlist.join(",")).split(",").map((s) => s.trim()).filter(Boolean),
        // Optional AV scan hook; internally no-ops unless enabled
        scan: avScan,
      }
    );

    if (!result.ok) {
      const duration = Math.round(performance.now() - started);
      log.warn("Upload: validation failed", { duration, error: result.error });
  // Propagate quota headers if present
  const resHeaders: Record<string, string> = {}
  const lim = req.headers.get('x-upload-limit')
  const rem = req.headers.get('x-upload-remaining')
  if (lim) resHeaders['X-Upload-Limit'] = lim
  if (rem) resHeaders['X-Upload-Remaining'] = rem
      recordMetric("upload_rejected_validation", 1);
      void writeAuditLog({
        event: "upload.validation_failed",
        action: "upload",
        resource: "/api/uploads",
        allowed: false,
        ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
        metadata: { error: result.error },
      });
  return NextResponse.json({ error: result.error }, { status: 400, headers: resHeaders });
    }

    // At this point, buffer is validated. In a real app, persist it to object storage.
    // For demo purposes, return metadata only.
    const duration = Math.round(performance.now() - started);
    log.info("Upload: validated", { duration, mime: result.mime, ext: result.ext, bytes: result.bytes });
  recordMetric("upload_accepted", 1);
    void writeAuditLog({
      event: "upload.validated",
      action: "upload",
      resource: "/api/uploads",
      allowed: true,
      ip: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
      metadata: { mime: result.mime, ext: result.ext, bytes: result.bytes },
    });
  // Propagate quota headers if present
  const resHeaders: Record<string, string> = {}
  const lim = req.headers.get('x-upload-limit')
  const rem = req.headers.get('x-upload-remaining')
  if (lim) resHeaders['X-Upload-Limit'] = lim
  if (rem) resHeaders['X-Upload-Remaining'] = rem

  return NextResponse.json({ ok: true, mime: result.mime, ext: result.ext, bytes: result.bytes }, { headers: resHeaders });
  } catch (e) {
    const duration = Math.round(performance.now() - started);
    const err = e as Error;
    log.error("Upload: unhandled error", { duration, error: err.message, stack: err.stack });
    recordMetric("upload_failed_unhandled", 1);
    void writeAuditLog({
      event: "upload.error",
      action: "upload",
      resource: "/api/uploads",
      allowed: false,
      metadata: { error: err.message },
    });
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
