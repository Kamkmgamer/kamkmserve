import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Lightweight health signal. Extend with deeper checks if needed.
  return NextResponse.json({ status: "ok", time: new Date().toISOString() });
}
