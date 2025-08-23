import path from "node:path";

export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export type UploadFile = {
  buffer: Buffer;
  filename: string;
  mimetype?: string | null;
  size?: number | null;
};

export type ValidateOptions = {
  maxBytes?: number;
  allowedExt?: string[]; // with leading dot, lowercase
  allowedMime?: string[]; // lowercase
  scan?: (buffer: Buffer) => Promise<{ ok: boolean; reason?: string }>;
};

export const defaultExtAllowlist = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
export const defaultMimeAllowlist = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

export async function validateUpload(file: UploadFile, opts: ValidateOptions = {}) {
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_SIZE;
  const allowedExt = (opts.allowedExt ?? defaultExtAllowlist).map((e) => e.toLowerCase());
  const allowedMime = (opts.allowedMime ?? defaultMimeAllowlist).map((m) => m.toLowerCase());

  if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
    return { ok: false as const, error: "Invalid file buffer" };
  }

  const size = file.size ?? file.buffer.length;
  if (size > maxBytes) {
    return { ok: false as const, error: `File too large. Max ${maxBytes} bytes` };
  }

  const ext = path.extname(file.filename).toLowerCase();
  if (!allowedExt.includes(ext)) {
    const extDisplay = ext && ext.length ? ext : "(none)";
    return { ok: false as const, error: `File extension not allowed: ${extDisplay}` };
  }

  // Best-effort magic number detection for common types
  const detected = detectMime(file.buffer) ?? (file.mimetype ?? "").toLowerCase();
  if (!allowedMime.includes(detected)) {
    const mimeDisplay = detected && detected.length ? detected : "unknown";
    return { ok: false as const, error: `MIME not allowed: ${mimeDisplay}` };
  }

  if (opts.scan) {
    const res = await opts.scan(file.buffer);
    if (!res.ok) return { ok: false as const, error: `Malware scan failed${res.reason ? ": " + res.reason : ""}` };
  }

  return { ok: true as const, mime: detected, ext, bytes: size };
}

function bytesStartsWith(buf: Buffer, sig: number[]) {
  if (buf.length < sig.length) return false;
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) return false;
  }
  return true;
}

function detectMime(buf: Buffer): string | undefined {
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (bytesStartsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  // JPEG: FF D8 FF
  if (bytesStartsWith(buf, [0xff, 0xd8, 0xff])) return "image/jpeg";
  // WEBP (RIFF....WEBP)
  if (
    bytesStartsWith(buf, [0x52, 0x49, 0x46, 0x46]) &&
    buf.length > 12 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  // PDF: 25 50 44 46 2D ('%PDF-')
  if (bytesStartsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return "application/pdf";
  return undefined;
}
