import "server-only";

import { predlogaZaRehab, privzeteVrednosti, vrednostiIzZdravil } from "@/lib/templates";
import { getApprovedPlan } from "@/lib/plans-server";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Checkin, type CheckinAnswers, type PatientValues, type Uuid } from "@/lib/types";
import { danOkrevanja, planQuestions, predlogaIzNacrta } from "./checkin-nacrt";
import { dueQuestions, sameAsYesterdaySource, toViews } from "./checkin-plan";
import { getMedsAndLogs } from "./doses";
import { answersFromPills } from "./med-answers";
import { getMyRehab } from "./rehabs";
import { addDays } from "./schedule";

const HISTORY_DAYS = 14;

/**
 * Everything the check-in page and its save action need, computed the same
 * way on both sides. Returns null when the rehabilitacija isn't the patient's.
 */
export async function loadCheckinContext(patientId: Uuid, rehabId: string) {
  const rehab = await getMyRehab(patientId, rehabId);
  const template = rehab ? predlogaZaRehab(rehab) : undefined;
  if (!rehab || !template) return null;

  const today = todayLjubljana();
  const supabase = await createClient();
  const [approved, { data, error }, { meds, logs }] = await Promise.all([
    getApprovedPlan(rehab.id),
    supabase
      .from("checkins")
      .select("*")
      .eq("rehab_id", rehab.id)
      .gte("checkin_date", addDays(today, -HISTORY_DAYS))
      .order("checkin_date", { ascending: false }),
    getMedsAndLogs(rehab.id),
  ]);
  if (error) throw new Error("Dnevnih pregledov ni bilo mogoče naložiti.");

  const all = (data ?? []) as Checkin[];
  const todayCheckin = all.find((c) => c.checkin_date === today);
  const history = all.filter((c) => c.checkin_date < today);
  // Medicine names in questions come from the rehabilitacija's current medicines (T-70).
  const current = meds.filter((m) => m.change !== "ukinjeno");
  const values: PatientValues = { ...privzeteVrednosti(template), ...rehab.patient_values, ...vrednostiIzZdravil(template, current) };

  // An approved plan (T-80) replaces the template's questions and rules.
  if (approved) {
    const predloga = predlogaIzNacrta(template, approved.plan);
    const questions = planQuestions(predloga, approved.plan, today, values, history);
    return {
      rehab,
      predloga,
      plan: { nacrt: approved.plan, version: approved.version, dan: danOkrevanja(approved.plan, today) },
      today,
      active: isRehabActive(rehab, today),
      history,
      todayCheckin,
      questions,
      known: {} as CheckinAnswers,
      values,
      sameSource: sameAsYesterdaySource(questions, history, today),
    };
  }

  const predloga = template;
  // Questions the pill list already answers aren't asked (unless nothing else would be left).
  const due = dueQuestions(predloga, rehab, history, today);
  const fromPills = answersFromPills(predloga, due, meds, logs, today);
  const asked = due.filter((q) => fromPills[q.id] === undefined);
  const known = asked.length ? fromPills : {};
  const questions = toViews(predloga, asked.length ? asked : due, values, history);

  return {
    rehab,
    predloga,
    plan: undefined,
    today,
    active: isRehabActive(rehab, today),
    history,
    todayCheckin,
    questions,
    /** Answers taken from the pill list; saved with the check-in. */
    known,
    /** Patient values with medicine names filled in, for texts and triage. */
    values,
    sameSource: sameAsYesterdaySource(questions, history, today),
  };
}
