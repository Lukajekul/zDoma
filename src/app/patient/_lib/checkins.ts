import "server-only";

import { getPredloga, privzeteVrednosti, vrednostiIzZdravil } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Checkin, type PatientValues, type Uuid } from "@/lib/types";
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
  const predloga = rehab ? getPredloga(rehab.template_id) : undefined;
  if (!rehab || !predloga) return null;

  const today = todayLjubljana();
  const supabase = await createClient();
  const [{ data, error }, { meds, logs }] = await Promise.all([
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
  const values: PatientValues = { ...privzeteVrednosti(predloga), ...rehab.patient_values, ...vrednostiIzZdravil(predloga, current) };
  // Questions the pill list already answers aren't asked (unless nothing else would be left).
  const due = dueQuestions(predloga, rehab, history, today);
  const fromPills = answersFromPills(predloga, due, meds, logs, today);
  const asked = due.filter((q) => fromPills[q.id] === undefined);
  const known = asked.length ? fromPills : {};
  const questions = toViews(predloga, asked.length ? asked : due, values, history);

  return {
    rehab,
    predloga,
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
