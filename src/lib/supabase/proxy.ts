import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { supabaseEnv } from "./env";

/** Areas that need a logged-in user. Staff-only checks live in the pages (requireStaff). */
const PROTECTED = ["/patient", "/carer", "/nurse"];

/**
 * Refreshes the Supabase session cookie on every request so users stay
 * logged in, and sends logged-out users from protected areas to /prijava.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, anonKey } = supabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Don't run code between createServerClient and getClaims():
  // it validates and refreshes the session.
  const { data } = await supabase.auth.getClaims();
  let loggedIn = Boolean(data?.claims);

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  // getClaims() only checks the JWT signature. On protected pages also ask Auth
  // that the session still exists, so "Nova koda QR" (which deletes every
  // session) logs out other devices at once, not when their token expires.
  if (loggedIn && isProtected) {
    const { error } = await supabase.auth.getUser();
    if (error) {
      await supabase.auth.signOut({ scope: "local" }); // clears the stale cookies
      loggedIn = false;
    }
  }

  if (!loggedIn && isProtected) {
    const loginUrl = request.nextUrl.clone();
    // Patients get their own login page (QR first time, then their own password).
    loginUrl.pathname = path === "/patient" || path.startsWith("/patient/") ? "/prijava/pacient" : "/prijava";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    // Keep any refreshed or cleared auth cookies.
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  return response;
}
