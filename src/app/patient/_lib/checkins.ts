import "server-only";

import { getPredloga } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Checkin, type Uuid } from "@/lib/types";
import { dueQuestions, sameAsYesterdaySource, toViews } from "./checkin-plan";
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
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("rehab_id", rehab.id)
    .gte("checkin_date", addDays(today, -HISTORY_DAYS))
    .order("checkin_date", { ascending: false });
  if (error) throw new Error("Dnevnih pregledov ni bilo mogoče naložiti.");

  const all = (data ?? []) as Checkin[];
  const todayCheckin = all.find((c) => c.checkin_date === today);
  const history = all.filter((c) => c.checkin_date < today);
  const questions = toViews(predloga, dueQuestions(predloga, rehab, history, today), rehab.patient_values, history);

  return {
    rehab,
    predloga,
    today,
    active: isRehabActive(rehab, today),
    history,
    todayCheckin,
    questions,
    sameSource: sameAsYesterdaySource(questions, history, today),
  };
}
