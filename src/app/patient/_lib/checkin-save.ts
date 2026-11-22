import "server-only";

import type { CheckinInput } from "@/app/patient/[rehabId]/pregled/actions";
import { oceniNacrt } from "@/lib/moduli";
import { createClient } from "@/lib/supabase/server";
import { dodajPacientoveOznake, oceniPregled } from "@/lib/triage";
import type { TriageStatus } from "@/lib/types";
import { collectAnswers, copyFromYesterday, type QuestionView } from "./checkin-plan";
import type { loadCheckinContext } from "./checkins";
import { cleanPhotoPaths } from "./photo-paths";

type Ctx = NonNullable<Awaited<ReturnType<typeof loadCheckinContext>>>;

const TRY_AGAIN = "Ni uspelo shraniti. Preverite internetno povezavo in poskusite znova.";
const MISSING = "Manjka odgovor. Pojdite nazaj in odgovorite na vsa vprašanja.";

/**
 * Saves today's check-in (patient, zadolženec or home visit: the caller checks
 * access), runs triage and raises alerts. With an approved plan the answers are
 * keyed by its item ids, triage comes from `oceniNacrt` and `plan_version` is set.
 * The row is saved as the logged-in user (entered_by, RLS).
 */
export async function insertCheckin(ctx: Ctx, input: CheckinInput): Promise<{ error?: string }> {
  // Recompute on the server: never trust copied answers from the client.
  const same = input.sameAsYesterday && ctx.sameSource ? copyFromYesterday(ctx.questions, ctx.sameSource) : {};
  const skipped: QuestionView[] = [];
  const collected = collectAnswers(ctx.questions, input.answers, same, input.skipped ?? [], skipped);
  if (!collected) return { error: MISSING };
  const answers = { ...ctx.known, ...collected };
  const prejsnji = ctx.history.map((c) => ({ datum: c.checkin_date, odgovori: c.answers }));
  const danes = { datum: ctx.today, odgovori: answers };

  let status: TriageStatus;
  let reasons: string[];
  if (ctx.plan) {
    const o = oceniNacrt({ nacrt: ctx.plan.nacrt, vrednosti: ctx.values, dan: ctx.plan.dan, danes, prejsnji });
    status = o.status;
    reasons = o.oznake.map((r) => r.besedilo);
  } else {
    const o = oceniPregled({
      predloga: ctx.predloga,
      vrednosti: ctx.values,
      danes,
      prejsnji,
      izbranaVprasanja: ctx.rehab.questions.length ? ctx.rehab.questions : undefined,
    });
    status = o.status;
    reasons = o.razlogi.map((r) => r.besedilo);
  }
  // T-94: a skipped question or "druga težava" is never read as "all fine".
  ({ status, razlogi: reasons } = dodajPacientoveOznake({
    status,
    razlogi: reasons,
    preskocena: skipped.map((q) => q.text),
    drugaTezava: input.otherProblem === true,
  }));

  const supabase = await createClient();
  const { data: saved, error } = await supabase
    .from("checkins")
    .insert({
      rehab_id: ctx.rehab.id,
      checkin_date: ctx.today,
      answers,
      same_as_yesterday: Object.keys(same).length > 0,
      triage_status: status,
      reasons,
      plan_version: ctx.plan?.version ?? null,
      ...cleanPhotoPaths(ctx.rehab.id, input.photoPaths),
    })
    .select("id")
    .single();
  if (error || !saved) return { error: TRY_AGAIN };

  if (status !== "zeleno") {
    await supabase.from("alerts").insert(
      reasons.map((reason) => ({ rehab_id: ctx.rehab.id, checkin_id: saved.id, status, reason, source: "checkin" as const })),
    );
  }
  return {};
}
