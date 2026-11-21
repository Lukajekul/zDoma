"use server";

import { refresh } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";
import { addDaysIso } from "../_lib/plan";

/** A finished rehabilitacija can be reopened this many days after its end. Product setting. */
const REOPEN_DAYS = 14;

/**
 * "Podaljšaj": move the end date later; also reopens one that ended at most
 * REOPEN_DAYS ago. Keeps the original end date in patient_values.prvotniKonec
 * (the patient sees "Okrevanje podaljšano do …"). Written to audit_log.
 */
export async function extendRehab(rehabId: string, newEnd: string): Promise<{ error?: string; ok?: boolean }> {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("rehabilitacije")
    .select("id, status, end_date, patient_values")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r) return { error: "Rehabilitacije ni mogoče najti." };

  const today = todayLjubljana();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(newEnd) || newEnd <= r.end_date || newEnd < today) {
    return { error: "Novi konec mora biti po sedanjem koncu in ne v preteklosti." };
  }
  const ended = r.status === "zakljucena" || r.end_date < today;
  if (ended && addDaysIso(r.end_date, REOPEN_DAYS) < today) {
    return { error: `Rehabilitacija se je končala pred več kot ${REOPEN_DAYS} dnevi. Odprite novo.` };
  }

  const values = (r.patient_values ?? {}) as Record<string, string | number>;
  const { error } = await supabase
    .from("rehabilitacije")
    .update({
      end_date: newEnd,
      status: "aktivna",
      patient_values: { ...values, prvotniKonec: values.prvotniKonec ?? r.end_date },
    })
    .eq("id", r.id);
  if (error) return { error: "Ni uspelo shraniti. Poskusite znova." };

  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action: ended ? "ponovno_odpri_rehabilitacijo" : "podaljsaj_rehabilitacijo",
    entity: "rehabilitacije",
    entity_id: r.id,
    details: { prejsnjiKonec: r.end_date, noviKonec: newEnd },
  });
  refresh();
  return { ok: true };
}
