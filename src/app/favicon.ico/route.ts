import { NextResponse } from "next/server";

// Serve favicon by redirecting to the configured external icon URL in `src/app/layout.tsx`.
// This resolves browsers directly requesting `/favicon.ico`.
const FAVICON_URL = "https://ik.imagekit.io/gtnmxyt2d/servises%20store/favicon.png";

export async function GET() {
  return NextResponse.redirect(FAVICON_URL, 308);
}
