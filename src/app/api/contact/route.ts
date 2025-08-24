import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // TODO: Integrate email provider (e.g., Resend, SendGrid). For now, log.
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
