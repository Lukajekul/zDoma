"use server";

import { refresh } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";
import { addDaysIso } from "../_lib/plan";

/** A finished rehabilitacija can be reopened this many days after its end. Product setting. */
const REOPEN_DAYS = 14;
/** Largest single step of the length stepper. */
const MAX_STEP_DAYS = 365;

type Result = { error?: string; ok?: boolean; newEnd?: string };

/**
 * Length stepper: move the end date by `days` (positive = "Podaljšaj", negative = shorten).
 * Extending also reopens one that ended at most REOPEN_DAYS ago and keeps the original
 * end date in patient_values.prvotniKonec (the patient sees "Okrevanje podaljšano do …").
 * Shortening never puts the end date before today (Europe/Ljubljana) or the start date.
 * Every change is written to audit_log.
 */
export async function changeRehabEnd(rehabId: string, days: number): Promise<Result> {
  const staff = await requireStaff();
  if (!Number.isInteger(days) || days === 0 || Math.abs(days) > MAX_STEP_DAYS) {
    return { error: `Vpišite število dni od 1 do ${MAX_STEP_DAYS}.` };
  }
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("rehabilitacije")
    .select("id, status, start_date, end_date, patient_values")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r) return { error: "Rehabilitacije ni mogoče najti." };

  const today = todayLjubljana();
  const ended = r.status === "zakljucena" || r.end_date < today;
  const newEnd = addDaysIso(r.end_date, days);
  const values = (r.patient_values ?? {}) as Record<string, string | number>;

  let update: { end_date: string; status?: "aktivna"; patient_values?: Record<string, string | number> };
  let action: string;
  if (days > 0) {
    if (ended && addDaysIso(r.end_date, REOPEN_DAYS) < today) {
      return { error: `Rehabilitacija se je končala pred več kot ${REOPEN_DAYS} dnevi. Odprite novo.` };
    }
    if (newEnd < today) return { error: `Nov konec bi bil v preteklosti. Dodajte več dni (vsaj do ${formatDate(today)}).` };
    update = { end_date: newEnd, status: "aktivna", patient_values: { ...values, prvotniKonec: values.prvotniKonec ?? r.end_date } };
    action = ended ? "ponovno_odpri_rehabilitacijo" : "podaljsaj_rehabilitacijo";
  } else {
    if (ended) return { error: "Končane rehabilitacije ni mogoče skrajšati." };
    if (newEnd < today || newEnd < r.start_date) {
      return { error: `Konec ne more biti pred danes (${formatDate(today)}). Skrajšajte za manj dni.` };
    }
    update = { end_date: newEnd };
    action = "skrajsaj_rehabilitacijo";
  }

  const { error } = await supabase.from("rehabilitacije").update(update).eq("id", r.id);
  if (error) return { error: "Ni uspelo shraniti. Poskusite znova." };

  await supabase.from("audit_log").insert({
    actor_id: staff.id,
    action,
    entity: "rehabilitacije",
    entity_id: r.id,
    details: { prejsnjiKonec: r.end_date, noviKonec: newEnd, dni: days },
  });
  refresh();
  return { ok: true, newEnd };
}
