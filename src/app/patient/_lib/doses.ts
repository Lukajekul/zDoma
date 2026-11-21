import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { DoseLog, IsoDate, Medication, Rehabilitacija } from "@/lib/types";
import { addDays, unloggedDoses } from "./schedule";

/** Medications and all dose logs of one rehabilitacija (RLS: own or approved family). */
export async function getMedsAndLogs(rehabId: string) {
  const supabase = await createClient();
  const [meds, logs] = await Promise.all([
    supabase.from("medications").select("*").eq("rehab_id", rehabId).order("name"),
    supabase.from("dose_logs").select("*").eq("rehab_id", rehabId),
  ]);
  if (meds.error || logs.error) throw new Error("Zdravil ni bilo mogoče naložiti.");
  return { meds: (meds.data ?? []) as Medication[], logs: (logs.data ?? []) as DoseLog[] };
}

/**
 * Logs every past dose (start of the rehabilitacija up to yesterday) that has
 * no entry as "izpusceno". Idempotent. Call as the patient: entered_by is the
 * logged-in user. Returns the logs including the new rows.
 */
export async function logMissedDoses(
  rehab: Pick<Rehabilitacija, "id" | "start_date" | "end_date">,
  meds: Medication[],
  logs: DoseLog[],
  today: IsoDate,
): Promise<DoseLog[]> {
  const yesterday = addDays(today, -1);
  const to = rehab.end_date < yesterday ? rehab.end_date : yesterday;
  const missed = unloggedDoses(meds, logs, rehab.start_date, to);
  if (!missed.length) return logs;

  const supabase = await createClient();
  const { data } = await supabase
    .from("dose_logs")
    .upsert(
      missed.map((m) => ({ ...m, rehab_id: rehab.id, status: "izpusceno" as const })),
      { onConflict: "medication_id,scheduled_date,time_of_day", ignoreDuplicates: true },
    )
    .select("*");
  return [...logs, ...((data ?? []) as DoseLog[])];
}
