"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile, homePathFor, LOGIN_PATH, PATIENT_LOGIN_PATH } from "@/lib/auth";
import { davcnaError, normalizeDavcna } from "@/lib/davcna";
import { setOwnPassword } from "@/lib/qr/accounts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { davcnaEmail } from "@/lib/types";

export type FormState = {
  error?: string;
  /** Values to put back into the form after an error (never the password). */
  values?: Record<string, string>;
};

const MIN_PASSWORD = 8;

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

async function goHome(): Promise<never> {
  const profile = await getCurrentProfile();
  redirect(profile ? await homePathFor(profile) : LOGIN_PATH);
}

/** Login with davčna številka + password: family (zadolženci) and patients who already set their own password. Staff use loginStaff. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const davcna = normalizeDavcna(text(formData, "davcna"));
  const password = String(formData.get("password") ?? "");
  const values = { davcna };

  const davcnaProblem = davcnaError(davcna);
  if (davcnaProblem) return { error: davcnaProblem, values };
  if (!password) return { error: "Vpišite geslo.", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: davcnaEmail(davcna), password });
  if (error) {
    return { error: "Davčna številka ali geslo ni pravilno. Preverite in poskusite znova.", values };
  }
  return goHome();
}

const STAFF_LOGIN_ERROR = "E-pošta ali geslo ni pravilno. Preverite in poskusite znova.";

/**
 * Staff (bolničarji, patronažne sestre) and študenti pomočniki log in with their email + password (T-67, T-86).
 * Only `is_staff` profiles and students (`student_until` set) get through; anyone else is signed out, so this
 * form never logs in a patient or family member (the nurse area is still gated by requireStaff).
 */
export async function loginStaff(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = text(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Vpišite svoj službeni e-poštni naslov, na primer ime.priimek@zdoma.demo.", values };
  }
  // Internal davčna logins never go through the staff form.
  if (email.endsWith("@zdoma.local")) return { error: STAFF_LOGIN_ERROR, values };
  if (!password) return { error: "Vpišite geslo.", values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: STAFF_LOGIN_ERROR, values };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_staff, student_until")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile?.is_staff && !profile?.student_until) {
    await supabase.auth.signOut({ scope: "local" });
    return { error: "Ta prijava je samo za osebje. Svojci se prijavijo z davčno številko.", values };
  }
  redirect(profile.is_staff ? "/nurse" : "/student");
}

/** Family member (zadolženec) registers themselves. Staff accounts are never self-registered. */
export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const davcna = normalizeDavcna(text(formData, "davcna"));
  const firstName = text(formData, "first_name");
  const lastName = text(formData, "last_name");
  const password = String(formData.get("password") ?? "");
  const values = { davcna, first_name: firstName, last_name: lastName };

  if (!firstName || !lastName) return { error: "Vpišite ime in priimek.", values };
  const davcnaProblem = davcnaError(davcna);
  if (davcnaProblem) return { error: davcnaProblem, values };
  if (password.length < MIN_PASSWORD) {
    return { error: `Geslo naj ima vsaj ${MIN_PASSWORD} znakov.`, values };
  }

  // Created server-side and confirmed: <davcna>@zdoma.local can't receive email.
  // The profile row is made by the on_auth_user_created trigger (is_staff = false).
  const admin = createAdminClient();
  const { error: createError } = await admin.auth.admin.createUser({
    email: davcnaEmail(davcna),
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (createError) {
    return {
      error: "Računa ni bilo mogoče ustvariti. Če ga že imate, se prijavite. Sicer pokličite patronažno sestro.",
      values,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: davcnaEmail(davcna), password });
  if (error) return { error: "Račun je ustvarjen. Prijavite se z davčno številko in geslom.", values };
  return goHome();
}

/** First login with the QR: the patient replaces the starting password with their own (T-54). */
export async function setPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(PATIENT_LOGIN_PATH);
  const password = String(formData.get("password") ?? "");
  const repeat = String(formData.get("password_repeat") ?? "");

  if (password.length < MIN_PASSWORD) return { error: `Geslo naj ima vsaj ${MIN_PASSWORD} znakov.` };
  if (password !== repeat) return { error: "Gesli nista enaki. Vpišite isto geslo dvakrat." };
  if (password.includes(profile.davcna)) return { error: "Geslo naj ne vsebuje vaše davčne številke. Izberite drugo." };

  try {
    await setOwnPassword(profile.id, password);
  } catch {
    return { error: "Gesla ni bilo mogoče shraniti. Poskusite znova čez minuto." };
  }
  return goHome();
}

/** Signs out this device. */
export async function logout(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect(LOGIN_PATH);
}

/** "Naprej" on the account card: go to the user's home screen. */
export async function continueHome(): Promise<never> {
  return goHome();
}
