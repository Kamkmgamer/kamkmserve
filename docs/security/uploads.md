# Secure File Uploads

This guide outlines best practices and project conventions for handling user file uploads.

- Strongly prefer client-side validation PLUS server-side validation.
- Never trust `Content-Type` from the client. Always inspect and verify server-side.
- Store uploads outside of the web root or use signed URLs with short expirations.
- Generate random file names; never use raw user file names directly.
- Enforce strict allowlists for MIME types and file extensions.
- Enforce a maximum file size and reject oversize uploads early.
- For images, consider transcoding (e.g., to WebP/AVIF) and stripping metadata.
- Optionally integrate an AV/malware scanner in a background job before finalizing.
- Avoid evaluating content (e.g., SVG with scripts) unless sanitized.
- Record who uploaded, when, source IP/user-agent, and a content hash for auditing.

## Validation Helper

Use `src/lib/uploads.ts` to validate file size, extension, and MIME type before storage.

Example usage in an API route:

```ts
import { validateUpload, DEFAULT_MAX_SIZE, defaultMimeAllowlist } from "~/lib/uploads";

export async function POST(req: Request) {
  // parse multipart form (e.g., with busboy, formidable, or next/server experimental);
  const file = {
    buffer: Buffer.from(await someArrayBuffer),
    filename: originalFilename,
    mimetype: detectedMime, // from server-side detection when possible
    size: bufferLength,
  };

  const result = await validateUpload(file, {
    maxBytes: DEFAULT_MAX_SIZE,
    allowedExt: [".png", ".jpg", ".jpeg", ".webp"],
    allowedMime: defaultMimeAllowlist,
    // Optional scanner hook:
    // scan: async (buf) => clamavScan(buf)
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // proceed to store the buffer
}
```

## MIME and Extension Allowlist

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`
- Documents (optional): `.pdf`
- Avoid SVG unless sanitized: `.svg` can contain scripts. If allowed, sanitize and convert to safe subset.

## Size Limits

- Default max size: 10 MB. Adjust per route using the helper options.

## Storage

- Prefer object storage (S3, GCS) with private buckets and signed access.
- Set short-lived signed URLs and use Content-Disposition for downloads.

## Logging & Monitoring

- Log rejections (type, size) at info level; avoid logging full file names with PII.
- Alert on spikes in upload failures; may indicate probing.
