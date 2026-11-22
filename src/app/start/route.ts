import { NextResponse, type NextRequest } from "next/server";
import { getCurrentProfile, homePathFor } from "@/lib/auth";

/**
 * Start URL of the installed app (T-88): opens each user's own home screen.
 * Logged out → the "Sem pacient / Osebje ali svojci" chooser.
 */
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  const path = profile ? await homePathFor(profile) : "/";
  return NextResponse.redirect(new URL(path, request.url));
}
