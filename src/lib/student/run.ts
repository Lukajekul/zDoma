import "server-only";

// Študent pomočnik: visit reminders, run by the same 15-minute cron as T-39.
// 30 min before a visit → the student. Nothing marked 30 min after → the
// student ("Zamujate") and, at the same time, the nurse (push + an alert on
// her dashboard). Idempotent per assignment, day, slot and kind.
import { dosesOn } from "@/app/patient/_lib/schedule";
import { sendPush } from "@/lib/push/send";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayLjubljana, type DoseLog, type Medication, type TimeOfDay } from "@/lib/types";
import { clock, planVisitReminders, visitSlots, type StudentVisit } from "./visits";

const SLOT_WORD: Record<TimeOfDay, string> = { zjutraj: "jutranji", opoldne: "opoldanski", zvecer: "večerni", ponoci: "nočni" };

function nowLjubljana(now: Date): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Ljubljana", hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
}

export async function runStudentReminders(now: Date = new Date()): Promise<{ planned: number; reached: number }> {
  const admin = createAdminClient();
  const today = todayLjubljana(now);

  const { data: assignments, error } = await admin
    .from("student_assignments")
    .select(
      "id, student_id, patient_id, assigned_by, student:profiles!student_assignments_student_id_fkey(first_name, student_until), patient:profiles!student_assignments_patient_id_fkey(first_name, last_name, checkin_time)",
    )
    .eq("status", "approved");
  if (error) throw new Error(error.message);
  const live = (assignments ?? []).filter((a) => a.student?.student_until && today <= a.student.student_until);
  if (!live.length) return { planned: 0, reached: 0 };

  const { data: rehabs } = await admin
    .from("rehabilitacije")
    .select("id, patient_id, assigned_nurse_id")
    .in("patient_id", live.map((a) => a.patient_id))
    .eq("status", "aktivna")
    .lte("start_date", today)
    .gte("end_date", today);
  if (!rehabs?.length) return { planned: 0, reached: 0 };
  const rehabIds = rehabs.map((r) => r.id);

  const [{ data: meds }, { data: logs }, { data: checkins }, { data: sent }] = await Promise.all([
    admin.from("medications").select("*").in("rehab_id", rehabIds),
    admin.from("dose_logs").select("*").in("rehab_id", rehabIds).eq("scheduled_date", today),
    admin.from("checkins").select("rehab_id").in("rehab_id", rehabIds).eq("checkin_date", today),
    admin.from("student_reminders_sent").select("assignment_id, slot, kind").in("assignment_id", live.map((a) => a.id)).eq("day", today),
  ]);

  const visits: StudentVisit[] = [];
  for (const a of live) {
    const rehab = rehabs.find((r) => r.patient_id === a.patient_id);
    if (!rehab) continue;
    const groups = dosesOn(
      ((meds ?? []) as Medication[]).filter((m) => m.rehab_id === rehab.id),
      ((logs ?? []) as DoseLog[]).filter((l) => l.rehab_id === rehab.id),
      today,
    );
    visits.push({
      assignmentId: a.id,
      checkinTime: a.patient?.checkin_time ?? "08:00",
      slots: visitSlots(
        groups.map((g) => ({ slot: g.time, allMarked: g.doses.every((d) => !!d.log) })),
        (checkins ?? []).some((c) => c.rehab_id === rehab.id),
      ),
      sent: (sent ?? []).filter((s) => s.assignment_id === a.id).map((s) => `${s.slot}:${s.kind}`),
    });
  }

  const plan = planVisitReminders(visits, nowLjubljana(now));
  let reached = 0;
  for (const p of plan) {
    // Record first, so an overlapping run can't send the same reminder twice.
    const { error: markError } = await admin
      .from("student_reminders_sent")
      .insert({ assignment_id: p.assignmentId, day: today, slot: p.slot, kind: p.kind });
    if (markError) continue;

    const a = live.find((x) => x.id === p.assignmentId)!;
    const rehab = rehabs.find((r) => r.patient_id === a.patient_id)!;
    // No diagnosis or medicine names in notifications (AGENTS.md §5a).
    const patient = `${a.patient?.first_name ?? ""} ${(a.patient?.last_name ?? "").slice(0, 1)}.`.trim();
    const studentUrl = `/student/${rehab.id}`;

    if (p.kind === "prej") {
      reached += await sendPush([a.student_id], {
        title: "zDoma",
        body: `Čez 30 minut: ${SLOT_WORD[p.slot]} obisk pri ${patient} (${clock(p.at)}).`,
        url: studentUrl,
      });
      continue;
    }

    reached += await sendPush([a.student_id], {
      title: "zDoma",
      body: `Zamujate: pri ${patient} še ni nič označeno (${SLOT_WORD[p.slot]} obisk ob ${clock(p.at)}).`,
      url: studentUrl,
    });
    const nurseId = rehab.assigned_nurse_id ?? a.assigned_by;
    const reason = `Študent ${a.student?.first_name ?? ""} še ni označil obiska (${SLOT_WORD[p.slot]}, ${clock(p.at)})`;
    await admin.from("alerts").insert({ rehab_id: rehab.id, status: "rumeno", reason, source: "drugo" });
    if (nurseId) reached += await sendPush([nurseId], { title: "zDoma", body: `${patient}: ${reason}.`, url: `/nurse/${rehab.id}` });
  }
  return { planned: plan.length, reached };
}
