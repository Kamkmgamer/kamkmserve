import { NextResponse } from "next/server";

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message } = body as ContactRequestBody;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // TODO: Integrate email provider (e.g., Resend, SendGrid). For now, log.
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact form error:", e);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
