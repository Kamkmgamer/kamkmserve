import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { env } from "~/env.js";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid fields", issues: result.error.issues },
        { status: 400 }
      );
    }

    const { name, email, message } = result.data;

    const resend = new Resend(env.RESEND_API_KEY);

    const to = env.CONTACT_TO ?? "support@kamkmserve.com";

    const subject = `New contact message from ${name}`;
    const text = `From: ${name} <${email}>

${message}`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Helvetica, Apple Color Emoji, Segoe UI Emoji; line-height: 1.6;">
        <h2 style="margin:0 0 8px;">New contact message</h2>
        <p style="margin:0 0 16px; color:#475569;">You received a new message from the website contact form.</p>
        <div style="background:#f8fafc; padding:12px 14px; border-radius:8px; margin-bottom:16px;">
          <div><strong>Name:</strong> ${escapeHtml(name)}</div>
          <div><strong>Email:</strong> ${escapeHtml(email)}</div>
        </div>
        <pre style="white-space:pre-wrap; word-wrap:break-word; background:#f1f5f9; padding:12px 14px; border-radius:8px;">${escapeHtml(message)}</pre>
      </div>
    `;

    try {
      const { error } = await resend.emails.send({
        from: "KAMKM Serve <onboarding@resend.dev>",
        to,
        subject,
        text,
        html,
        reply_to: email,
      } as any);

      if (error) {
        console.error("Resend error:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
      }
    } catch (err) {
      console.error("Resend exception:", err);
      return NextResponse.json({ error: "Email service error" }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

function escapeHtml(str: string) {
  return str
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/\"/g, "&quot;")
    .replaceAll(/'/g, "&#039;");
}
