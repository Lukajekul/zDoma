import "server-only";

// T-45: log yesterday's untaken pills as "izpusceno" for every active
// rehabilitacija, so staff and the zadolženec see gaps even when the patient
// never opens the pill page. Runs on the T-39 cron (/api/cron/opomniki).
// Idempotent: existing logs are never touched (unique medication+date+time).
import { addDays, unloggedDoses } from "@/app/patient/_lib/schedule";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayLjubljana, type DoseLog, type Medication } from "@/lib/types";

/** Days back to check: yesterday, plus the day before in case a night's run failed. */
const DAYS_BACK = 2;

/** `rehabIds` limits the run (tests, one patient); omit it for the daily job. */
export async function logMissedDosesForAll(now: Date = new Date(), rehabIds?: string[]): Promise<{ logged: number }> {
  const admin = createAdminClient();
  const today = todayLjubljana(now);
  const from = addDays(today, -DAYS_BACK);
  const to = addDays(today, -1); // never today: today's pills can still be taken

  let query = admin
    .from("rehabilitacije")
    .select("id, patient_id, start_date, end_date")
    .eq("status", "aktivna")
    .lte("start_date", to)
    .gte("end_date", from);
  if (rehabIds) query = query.in("id", rehabIds);
  const { data: rehabs, error } = await query;
  if (error) throw new Error(error.message);
  if (!rehabs?.length) return { logged: 0 };

  const ids = rehabs.map((r) => r.id);
  const [{ data: meds }, { data: logs }] = await Promise.all([
    admin.from("medications").select("*").in("rehab_id", ids),
    admin.from("dose_logs").select("*").in("rehab_id", ids).gte("scheduled_date", from).lte("scheduled_date", to),
  ]);

  const rows = rehabs.flatMap((r) => {
    const start = r.start_date > from ? r.start_date : from;
    const end = r.end_date < to ? r.end_date : to;
    const rehabMeds = (meds ?? []).filter((m) => m.rehab_id === r.id) as Medication[];
    const rehabLogs = (logs ?? []).filter((l) => l.rehab_id === r.id) as DoseLog[];
    // Logged on the patient's behalf: the job has no user, and it isn't a zadolženec's entry.
    return unloggedDoses(rehabMeds, rehabLogs, start, end).map((m) => ({
      ...m, rehab_id: r.id, status: "izpusceno" as const, entered_by: r.patient_id,
    }));
  });
  if (rows.length === 0) return { logged: 0 };

  const { data, error: insertError } = await admin
    .from("dose_logs")
    .upsert(rows, { onConflict: "medication_id,scheduled_date,time_of_day", ignoreDuplicates: true })
    .select("id");
  if (insertError) throw new Error(insertError.message);
  return { logged: data?.length ?? 0 };
}
