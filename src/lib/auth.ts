import "server-only";

import { redirect } from "next/navigation";
import { connection } from "next/server";
import { hasStartingPassword } from "@/lib/qr/accounts";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const LOGIN_PATH = "/prijava";
/** Patient login: QR first time, then davčna številka + own password. */
export const PATIENT_LOGIN_PATH = "/prijava/pacient";
/** Where a patient sets their own password right after the first QR scan. */
export const SET_PASSWORD_PATH = "/prijava/geslo";

/** Logged-in user's profile, or null. Reads cookies: call inside <Suspense> or a Server Function. */
export async function getCurrentProfile(): Promise<Profile | null> {
  // Request-time only: the Supabase client reads the clock (Cache Components).
  await connection();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  return (data as Profile | null) ?? null;
}

/**
 * Profile of the logged-in user; redirects to /prijava when logged out, and to
 * "Nastavite svoje geslo" while a patient still has the starting password from the QR.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(LOGIN_PATH);
  if (!profile.is_staff && (await hasStartingPassword(profile.id))) redirect(SET_PASSWORD_PATH);
  return profile;
}

/** For bolničar pages: non-staff are sent to their own home screen. */
export async function requireStaff(): Promise<Profile> {
  const profile = await requireProfile();
  if (!profile.is_staff) redirect(await homePathFor(profile));
  return profile;
}

/**
 * Where a user lands after login: staff → /nurse, someone with their own
 * rehabilitacija → /patient, a family member only → /carer.
 */
export async function homePathFor(profile: Pick<Profile, "id" | "is_staff">): Promise<string> {
  if (profile.is_staff) return "/nurse";
  const supabase = await createClient();
  const { count } = await supabase
    .from("rehabilitacije")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", profile.id);
  return count && count > 0 ? "/patient" : "/carer";
}
