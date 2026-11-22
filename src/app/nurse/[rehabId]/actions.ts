"use server";

import { refresh } from "next/cache";
import { isAlertOutcome } from "@/components/nurse/alert-outcomes";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function resolveAlert(id: string, outcome: unknown) {
  await requireStaff();
  if (typeof id !== "string" || !uuid.test(id) || !isAlertOutcome(outcome)) return "invalid" as const;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("resolve_nurse_alert", { p_alert_id: id, p_action: outcome });

  if (error) return "error" as const;
  return data ? "saved" as const : "unavailable" as const;
}

type ApptResult = { ok?: boolean; error?: string };
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** T-64: set the next kontrolni pregled (optional). Written to audit_log. */
export async function addAppointment(rehabId: string, input: {
  date: string; time: string; place: string; doctor?: string; note?: string;
}): Promise<ApptResult> {
  const staff = await requireStaff();
  if (typeof rehabId !== "string" || !uuid.test(rehabId)) return { error: "Pacient ni najden." };
  const date = clean(input?.date, 10);
  const time = clean(input?.time, 5);
  const place = clean(input?.place, 120);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayLjubljana()) return { error: "Izberite datum danes ali kasneje." };
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return { error: "Vpišite uro, na primer 9:30." };
  if (!place) return { error: "Vpišite, kje bo kontrola (ambulanta)." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert({
      rehab_id: rehabId,
      appt_date: date,
      appt_time: time,
      place,
      doctor: clean(input?.doctor, 120) || null,
      note: clean(input?.note, 300) || null,
      created_by: staff.id,
    })
    .select("id")
    .single();
  if (error || !data) return { error: "Ni uspelo shraniti. Poskusite znova." };
  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: "kontrola_dodana",
    entity: "appointments",
    entity_id: data.id,
    details: { rehab_id: rehabId, datum: date, ura: time, kraj: place },
  });
  refresh();
  return { ok: true };
}

/** T-64: mark a kontrola "opravljeno" or cancel it. Written to audit_log. */
export async function setAppointmentStatus(id: string, status: unknown): Promise<ApptResult> {
  const staff = await requireStaff();
  if (typeof id !== "string" || !uuid.test(id) || (status !== "opravljeno" && status !== "preklicano")) {
    return { error: "Ni uspelo. Osvežite stran." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .eq("status", "nacrtovano")
    .select("rehab_id")
    .maybeSingle();
  if (error || !data) return { error: "Ni uspelo. Osvežite stran in poskusite znova." };
  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: status === "opravljeno" ? "kontrola_opravljena" : "kontrola_preklicana",
    entity: "appointments",
    entity_id: id,
    details: { rehab_id: data.rehab_id },
  });
  refresh();
  return { ok: true };
}
