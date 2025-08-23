import { NextResponse } from "next/server";
import { validateUpload, DEFAULT_MAX_SIZE, defaultExtAllowlist, defaultMimeAllowlist } from "~/lib/uploads";
import { avScan } from "~/lib/avscan";

// This route demonstrates secure file upload validation.
// Clients should POST multipart/form-data with a single field named "file".

export const runtime = "nodejs"; // Using Buffer; Edge runtime does not support Buffer

// Per-route size limit (bytes). Defaults to 10MB if not provided.
const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES ?? DEFAULT_MAX_SIZE);

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }

    // Early size guard using File.size before reading the buffer
    if (typeof file.size === "number" && file.size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large. Max ${MAX_BYTES} bytes` }, { status: 400 });
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
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // At this point, buffer is validated. In a real app, persist it to object storage.
    // For demo purposes, return metadata only.
    return NextResponse.json({
      ok: true,
      mime: result.mime,
      ext: result.ext,
      bytes: result.bytes,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
