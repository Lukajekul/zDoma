"use server";

import { redirect } from "next/navigation";
import { getCurrentProfile, homePathFor, LOGIN_PATH } from "@/lib/auth";
import { isValidDavcna, normalizeDavcna } from "@/lib/davcna";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { davcnaEmail } from "@/lib/types";

export type FormState = {
  error?: string;
  /** Values to put back into the form after an error (never the password). */
  values?: Record<string, string>;
};

const MIN_PASSWORD = 8;
const DAVCNA_ERROR =
  "Davčna številka ni pravilna. Preverite, da ste vpisali vseh 8 številk.";

function text(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v.trim() : "";
}

async function goHome(): Promise<never> {
  const profile = await getCurrentProfile();
  redirect(profile ? await homePathFor(profile) : LOGIN_PATH);
}

/** Bolničar and zadolženec login: davčna številka + password. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const davcna = normalizeDavcna(text(formData, "davcna"));
  const password = String(formData.get("password") ?? "");
  const values = { davcna };

  if (!isValidDavcna(davcna)) return { error: DAVCNA_ERROR, values };
  if (!password) return { error: "Vpišite geslo.", values };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: davcnaEmail(davcna), password });
  if (error) {
    return { error: "Davčna številka ali geslo ni pravilno. Preverite in poskusite znova.", values };
  }
  return goHome();
}

/** Family member (zadolženec) registers themselves. Staff accounts are never self-registered. */
export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const davcna = normalizeDavcna(text(formData, "davcna"));
  const firstName = text(formData, "first_name");
  const lastName = text(formData, "last_name");
  const password = String(formData.get("password") ?? "");
  const values = { davcna, first_name: firstName, last_name: lastName };

  if (!firstName || !lastName) return { error: "Vpišite ime in priimek.", values };
  if (!isValidDavcna(davcna)) return { error: DAVCNA_ERROR, values };
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
