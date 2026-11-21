import "server-only";

// T-39: the scheduled job. Called every 15 minutes by the Worker cron
// (worker.mjs → /api/cron/opomniki). Idempotent per rehab, day and step.
import { sendPush } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayLjubljana } from "@/lib/types";
import { planReminders, type ReminderKind } from "./plan";

function nowLjubljana(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
}

export async function runReminders(now: Date = new Date()): Promise<{ planned: number; reached: number }> {
  const admin = createAdminClient();
  const today = todayLjubljana(now);

  const { data: rehabs, error } = await admin
    .from("rehabilitacije")
    .select("id, patient_id, start_date, patient:profiles!rehabilitacije_patient_id_fkey(first_name, checkin_time)")
    .eq("status", "aktivna")
    .lte("start_date", today)
    .gte("end_date", today);
  if (error) throw new Error(error.message);
  if (!rehabs?.length) return { planned: 0, reached: 0 };

  const ids = rehabs.map((r) => r.id);
  const [{ data: done }, { data: sent }] = await Promise.all([
    admin.from("checkins").select("rehab_id").in("rehab_id", ids).eq("checkin_date", today),
    admin.from("reminders_sent").select("rehab_id, kind").in("rehab_id", ids).eq("day", today),
  ]);
  const doneSet = new Set((done ?? []).map((c) => c.rehab_id));

  const plan = planReminders(
    rehabs.map((r) => ({
      rehabId: r.id,
      patientId: r.patient_id,
      firstName: r.patient?.first_name ?? "",
      checkinTime: r.patient?.checkin_time ?? "08:00",
      doneToday: doneSet.has(r.id),
      sent: (sent ?? []).filter((s) => s.rehab_id === r.id).map((s) => s.kind as ReminderKind),
    })),
    nowLjubljana(now),
  );

  let reached = 0;
  for (const p of plan) {
    // Record first, so an overlapping run can't send the same step twice.
    const { error: markError } = await admin
      .from("reminders_sent")
      .insert(p.marks.map((kind) => ({ rehab_id: p.rehabId, day: today, kind })));
    if (markError) continue; // already sent by another run

    const rehab = rehabs.find((r) => r.id === p.rehabId)!;
    let userIds = [rehab.patient_id];
    let url = `/patient/${p.rehabId}`;
    if (p.kind === "zadolzenec") {
      const { data: carers } = await admin
        .from("family_access")
        .select("requester_id")
        .eq("patient_id", rehab.patient_id)
        .eq("status", "approved");
      userIds = (carers ?? []).map((c) => c.requester_id);
      url = "/carer";
    }
    reached += await sendPush(userIds, { title: p.title, body: p.body, url });
  }
  return { planned: plan.length, reached };
}
