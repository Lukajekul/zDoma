"use server";

// Zadolženec marks tasks done together with the patient. Same rules as the
// patient's actions (T-05/T-06/T-07), but access = approved family access.
// Rows are saved as the zadolženec (entered_by = auth.uid(), enforced by RLS).
import { refresh } from "next/cache";
import { cleanAnswer, copyFromYesterday } from "@/app/patient/_lib/checkin-plan";
import { loadCheckinContext } from "@/app/patient/_lib/checkins";
import { isScheduledOn, TIME_ORDER } from "@/app/patient/_lib/schedule";
import type { CheckinInput } from "@/app/patient/[rehabId]/pregled/actions";
import { createClient } from "@/lib/supabase/server";
import { oceniPregled } from "@/lib/triage";
import type { CheckinAnswers, Medication, TimeOfDay } from "@/lib/types";
import { getCarerRehab } from "../_lib/access";

type Result = { error?: string };

const TRY_AGAIN = "Ni uspelo. Preverite internetno povezavo in poskusite znova.";
const CLOSED = "To okrevanje je zaključeno. Tukaj ne označujete več.";

async function activeRehab(rehabId: string) {
  const c = await getCarerRehab(rehabId);
  return c && c.active ? c : null;
}

/** "Vzeto" for one dose today. */
export async function carerMarkTaken(rehabId: string, medicationId: string, time: TimeOfDay): Promise<Result> {
  const c = await activeRehab(rehabId);
  if (!c || !TIME_ORDER.includes(time)) return { error: CLOSED };

  const supabase = await createClient();
  const { data } = await supabase
    .from("medications")
    .select("*")
    .eq("id", medicationId)
    .eq("rehab_id", c.rehab.id)
    .maybeSingle();
  const m = data as Medication | null;
  if (!m || !isScheduledOn(m, c.today) || !m.times.includes(time)) {
    return { error: "Tega zdravila danes ob tem času ni v načrtu." };
  }
  const { error } = await supabase.from("dose_logs").upsert(
    { medication_id: m.id, rehab_id: c.rehab.id, scheduled_date: c.today, time_of_day: time, status: "vzeto" },
    { onConflict: "medication_id,scheduled_date,time_of_day", ignoreDuplicates: true },
  );
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** "Razveljavi" a "Vzeto" this zadolženec entered today. Never the patient's own entries. */
export async function carerUndoTaken(rehabId: string, logId: string): Promise<Result> {
  const c = await getCarerRehab(rehabId);
  if (!c) return { error: TRY_AGAIN };
  const supabase = await createClient();
  const { error } = await supabase
    .from("dose_logs")
    .delete()
    .eq("id", logId)
    .eq("rehab_id", c.rehab.id)
    .eq("scheduled_date", c.today)
    .eq("status", "vzeto")
    .eq("entered_by", c.profile.id);
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** One exercise session today: done (with pain 0–10) or skipped. */
export async function carerLogExercise(
  rehabId: string,
  rehabExerciseId: string,
  done: boolean,
  pain: number | null,
): Promise<Result> {
  const c = await activeRehab(rehabId);
  if (!c) return { error: CLOSED };
  if (pain !== null && !(Number.isInteger(pain) && pain >= 0 && pain <= 10)) return { error: TRY_AGAIN };

  const supabase = await createClient();
  const { data: ex } = await supabase
    .from("rehab_exercises")
    .select("id, times_per_day")
    .eq("id", rehabExerciseId)
    .eq("rehab_id", c.rehab.id)
    .eq("active", true)
    .maybeSingle();
  if (!ex) return { error: "Te vaje ni več v načrtu." };

  const { count } = await supabase
    .from("rehab_logs")
    .select("id", { count: "exact", head: true })
    .eq("rehab_exercise_id", ex.id)
    .eq("log_date", c.today);
  if ((count ?? 0) >= ex.times_per_day) return { error: "Ta vaja je danes že označena." };

  const { error } = await supabase.from("rehab_logs").insert({
    rehab_exercise_id: ex.id,
    rehab_id: c.rehab.id,
    log_date: c.today,
    done,
    pain: done ? pain : null,
  });
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** "Razveljavi" an exercise entry this zadolženec made today. */
export async function carerUndoExercise(rehabId: string, logId: string): Promise<Result> {
  const c = await getCarerRehab(rehabId);
  if (!c) return { error: TRY_AGAIN };
  const supabase = await createClient();
  const { error } = await supabase
    .from("rehab_logs")
    .delete()
    .eq("id", logId)
    .eq("rehab_id", c.rehab.id)
    .eq("log_date", c.today)
    .eq("entered_by", c.profile.id);
  if (error) return { error: TRY_AGAIN };
  refresh();
  return {};
}

/** Today's check-in answered together with the patient: triage and alerts as in T-05. */
export async function carerSaveCheckin(rehabId: string, input: CheckinInput): Promise<Result> {
  const c = await activeRehab(rehabId);
  if (!c) return { error: CLOSED };
  const ctx = await loadCheckinContext(c.patient.id, c.rehab.id);
  if (!ctx || !ctx.active) return { error: CLOSED };
  if (ctx.todayCheckin) {
    refresh();
    return {};
  }

  const same = input.sameAsYesterday && ctx.sameSource ? copyFromYesterday(ctx.questions, ctx.sameSource) : {};
  const answers: CheckinAnswers = { ...same };
  for (const q of ctx.questions) {
    if (same[q.id] !== undefined) continue;
    const v = cleanAnswer(q, input.answers[q.id]);
    if (v === undefined) return { error: "Manjka odgovor. Pojdite nazaj in odgovorite na vsa vprašanja." };
    answers[q.id] = v;
  }
  const photoPath = input.photoPath?.startsWith(`${ctx.rehab.id}/`) ? input.photoPath : null;

  const ocena = oceniPregled({
    predloga: ctx.predloga,
    vrednosti: ctx.rehab.patient_values,
    danes: { datum: ctx.today, odgovori: answers },
    prejsnji: ctx.history.map((h) => ({ datum: h.checkin_date, odgovori: h.answers })),
    izbranaVprasanja: ctx.rehab.questions.length ? ctx.rehab.questions : undefined,
  });

  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("checkins")
    .insert({
      rehab_id: ctx.rehab.id,
      checkin_date: ctx.today,
      answers,
      same_as_yesterday: Object.keys(same).length > 0,
      triage_status: ocena.status,
      reasons: ocena.razlogi.map((r) => r.besedilo),
      photo_path: photoPath,
    })
    .select("id")
    .single();
  if (error || !saved) return { error: TRY_AGAIN };

  if (ocena.status !== "zeleno") {
    const status = ocena.status;
    await supabase.from("alerts").insert(
      ocena.razlogi.map((r) => ({ rehab_id: ctx.rehab.id, checkin_id: saved.id, status, reason: r.besedilo, source: "checkin" as const })),
    );
  }
  refresh();
  return {};
}
