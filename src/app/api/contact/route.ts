import { NextResponse } from "next/server";
import { z } from "zod";

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

    // TODO: Integrate email provider (e.g., Resend, SendGrid). For now, log.
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Contact form error:", error);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
