// Supabase I/O for the seed: service-role client, cleanup and account creation.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type Admin = ReturnType<typeof adminClient>;

export function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local (AGENTS.md §9).");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Throws on a Supabase error so the seed stops at the first problem. */
export function ok<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}

/**
 * Removes everything a previous seed run created (users marked seed: true) and every
 * throwaway /demo patient (demo: true, T-96), so one seed run resets the demo data.
 * Other users are untouched.
 */
export async function cleanSeed(admin: Admin): Promise<number> {
  const seedIds: string[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const ours = (u: (typeof data.users)[number]) => u.user_metadata?.seed === true || u.user_metadata?.demo === true;
    seedIds.push(...data.users.filter(ours).map((u) => u.id));
    if (data.users.length < 1000) break;
  }
  if (seedIds.length === 0) return 0;
  // Rehabilitacije first: their logs go with them (entered_by would block deleting profiles, see T-47).
  ok(await admin.from("rehabilitacije").delete().in("patient_id", seedIds), "delete rehabilitacije");
  for (const t of ["dose_logs", "rehab_logs", "checkins"] as const) {
    ok(await admin.from(t).delete().in("entered_by", seedIds), `delete ${t}`);
  }
  for (const id of seedIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw new Error(`delete user: ${error.message}`);
  }
  return seedIds.length;
}

export interface Person {
  davcna: string;
  first: string;
  last: string;
}

/**
 * Creates a seed account. With `password` that is the login; without it a QR starting password is stored for the listek.
 * With `email` (staff, T-67) the account is created as `<davcna>@zdoma.local` so the trigger makes the profile,
 * then its login email is changed to the staff email.
 */
export async function createAccount(
  admin: Admin,
  p: Person,
  opts: { password?: string; staff?: boolean; email?: string; address?: string; obcina?: string },
): Promise<string> {
  const token = opts.password ? undefined : randomBytes(32).toString("base64url");
  const { data, error } = await admin.auth.admin.createUser({
    email: `${p.davcna}@zdoma.local`,
    password: opts.password ?? token,
    email_confirm: true,
    user_metadata: { first_name: p.first, last_name: p.last, seed: true },
  });
  if (error || !data.user) throw new Error(`create ${p.davcna}: ${error?.message}`);
  const id = data.user.id;
  if (opts.email) {
    const { error: emailError } = await admin.auth.admin.updateUserById(id, { email: opts.email, email_confirm: true });
    if (emailError) throw new Error(`set email ${opts.email}: ${emailError.message}`);
  }
  ok(
    await admin
      .from("profiles")
      .update({ is_staff: !!opts.staff, address: opts.address ?? null, obcina: opts.obcina ?? null })
      .eq("id", id),
    "update profile",
  );
  if (token) ok(await admin.from("patient_qr_tokens").insert({ patient_id: id, token }), "store qr token");
  return id;
}
