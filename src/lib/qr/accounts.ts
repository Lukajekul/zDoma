import "server-only";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { connection } from "next/server";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { davcnaEmail, type Uuid } from "@/lib/types";
import { isValidDavcna, normalizeDavcna } from "@/lib/davcna";
import { QR_PATH, qrFragment } from "./token";

/** ≥128 bits required; 256 bits as base64url = 43 characters. */
function newToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Patient account for a rehabilitacija (T-21). Reuses an existing account
 * (the new rehabilitacija simply appears in it); otherwise creates one whose
 * password is a fresh QR token. Server only; call after checking the caller is staff.
 */
export async function ensurePatientAccount(input: {
  davcna: string;
  firstName: string;
  lastName: string;
}): Promise<{ patientId: Uuid; created: boolean }> {
  const davcna = normalizeDavcna(input.davcna);
  if (!isValidDavcna(davcna)) throw new Error("invalid davcna");
  const admin = createAdminClient();

  const { data: existing } = await admin.from("profiles").select("id").eq("davcna", davcna).maybeSingle();
  if (existing) return { patientId: existing.id, created: false };

  const token = newToken();
  const { data, error } = await admin.auth.admin.createUser({
    email: davcnaEmail(davcna),
    password: token,
    email_confirm: true,
    user_metadata: { first_name: input.firstName.trim(), last_name: input.lastName.trim() },
  });
  if (error || !data.user) throw new Error(`createUser failed: ${error?.message}`);

  const { error: tokenError } = await admin
    .from("patient_qr_tokens")
    .insert({ patient_id: data.user.id, token });
  if (tokenError) throw new Error(`store token failed: ${tokenError.message}`);
  return { patientId: data.user.id, created: true };
}

/**
 * "Nova koda QR": new token as the password, every device signed out, the old
 * QR stops working at once. Written to audit_log. Also gives a QR to an
 * account that had none (e.g. a family member who becomes a patient; their
 * old password stops working).
 */
export async function rotateQrToken(patientId: Uuid, actorId: Uuid): Promise<{ email: string; token: string }> {
  const admin = createAdminClient();
  const token = newToken();

  const { data, error } = await admin.auth.admin.updateUserById(patientId, { password: token });
  if (error || !data.user.email) throw new Error(`update password failed: ${error?.message}`);
  const { error: upsertError } = await admin
    .from("patient_qr_tokens")
    .upsert({ patient_id: patientId, token, created_at: new Date().toISOString() });
  if (upsertError) throw new Error(`store token failed: ${upsertError.message}`);
  const { error: revokeError } = await admin.rpc("revoke_user_sessions", { p_user: patientId });
  if (revokeError) throw new Error(`sign out failed: ${revokeError.message}`);

  await admin.from("audit_log").insert({
    actor_id: actorId,
    action: "qr.rotate",
    entity: "profiles",
    entity_id: patientId,
  });
  return { email: data.user.email, token };
}

export type QrAccess = "staff" | "self" | "carer";

/**
 * Who may see a patient's login QR: staff, the patient, or an approved
 * zadolženec. Checked explicitly (profile visibility alone is not enough).
 */
export async function qrAccessFor(patientId: Uuid): Promise<{ userId: Uuid; access: QrAccess } | null> {
  await connection(); // request-time only (Cache Components)
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  if (userId === patientId) return { userId, access: "self" };

  const { data: me } = await supabase.from("profiles").select("is_staff").eq("id", userId).maybeSingle();
  if (me?.is_staff) return { userId, access: "staff" };

  const { data: link } = await supabase
    .from("family_access")
    .select("id")
    .eq("requester_id", userId)
    .eq("patient_id", patientId)
    .eq("status", "approved")
    .maybeSingle();
  return link ? { userId, access: "carer" } : null;
}

export type LoginQr = {
  firstName: string;
  lastName: string;
  /** Absolute login URL with the token in the fragment. */
  url: string;
  /** The QR as an SVG string. */
  svg: string;
};

/** The patient's current login QR, or null if they have none yet. Caller must check qrAccessFor first. */
export async function getLoginQr(patientId: Uuid): Promise<LoginQr | null> {
  const admin = createAdminClient();
  const [{ data: profile }, { data: row }] = await Promise.all([
    admin.from("profiles").select("davcna, first_name, last_name").eq("id", patientId).maybeSingle(),
    admin.from("patient_qr_tokens").select("token").eq("patient_id", patientId).maybeSingle(),
  ]);
  if (!profile || !row) return null;

  const url = `${await siteOrigin()}${QR_PATH}#${qrFragment(profile.davcna, row.token)}`;
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 2 });
  return { firstName: profile.first_name, lastName: profile.last_name, url, svg };
}

async function siteOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * True while the account still has its starting password (the QR token): the
 * patient must set their own password before using the app (T-54).
 */
export async function hasStartingPassword(userId: Uuid): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin.from("patient_qr_tokens").select("patient_id").eq("patient_id", userId).maybeSingle();
  return Boolean(data);
}

/**
 * The patient's own password replaces the starting one. The QR token is
 * deleted, so the printed listek stops working and can't be reprinted;
 * "Nova koda QR" makes a new starting password. Written to audit_log.
 */
export async function setOwnPassword(userId: Uuid, password: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) throw new Error(`update password failed: ${error.message}`);
  const { error: deleteError } = await admin.from("patient_qr_tokens").delete().eq("patient_id", userId);
  if (deleteError) throw new Error(`delete token failed: ${deleteError.message}`);
  await admin.from("audit_log").insert({
    actor_id: userId,
    action: "password.set",
    entity: "profiles",
    entity_id: userId,
  });
}
