import "server-only";

import { formatDate } from "@/lib/format";
import type { Nacrt } from "@/lib/moduli";
import { progressRing, ringQuestions } from "@/lib/progress-ring";
import type { Predloga } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import type { CheckinAnswers, IsoDate, Rehabilitacija } from "@/lib/types";
import { ringZaNacrt } from "./checkin-nacrt";

/**
 * Ring data for one rehabilitacija, plus "podaljšano do" when it was extended.
 * Extension is known only from `patient_values.prvotniKonec` (original end date, set by "Podaljšaj").
 * With an approved plan (T-80) the ring counts the plan's every-day items.
 */
export async function getRing(rehab: Rehabilitacija, predloga: Predloga, today: IsoDate, nacrt?: Nacrt) {
  const supabase = await createClient();
  const { data } = await supabase.from("checkins").select("checkin_date, answers").eq("rehab_id", rehab.id);
  const { ids, notCounting } = nacrt ? ringZaNacrt(nacrt) : ringQuestions(predloga, rehab);
  const ring = progressRing({
    startDate: rehab.start_date,
    endDate: rehab.end_date,
    today,
    questionIds: ids,
    notCounting,
    checkins: (data ?? []) as { checkin_date: IsoDate; answers: CheckinAnswers }[],
  });
  const original = rehab.patient_values.prvotniKonec;
  const extendedUntil = typeof original === "string" && rehab.end_date > original ? formatDate(rehab.end_date) : undefined;
  return { ring, extendedUntil };
}
