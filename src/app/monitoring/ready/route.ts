import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Extend with checks to dependencies (DB ping, external APIs) if desired.
  return NextResponse.json({ ready: true, time: new Date().toISOString() });
}
