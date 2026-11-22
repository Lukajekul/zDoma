// Pure check-in planning for a rehabilitacija with an approved plan (T-80):
// `izberiDanes` decides today's screens, follow-ups come right after their
// parent, red flags are never filled by "Enako kot včeraj". No I/O.
import { izberiDanes, oceniNacrt, type DanZgodovine, type Nacrt, type Postavka, type VnosNacrta } from "@/lib/moduli";
import type { Pravilo, Predloga, Vprasanje } from "@/lib/templates";
import { razlikaDni } from "@/lib/triage/datumi";
import type { Checkin, CheckinAnswers, IsoDate, PatientValues } from "@/lib/types";
import { followUpFor, toViews, type QuestionView } from "./checkin-plan";

const kotVprasanje = (p: Postavka): Vprasanje => ({ ...p, pogostost: "dnevno", privzetoIzbrano: true }) as Vprasanje;

/**
 * The rehabilitacija's template with the plan's items and rules in place of its
 * own questions and rules, so the shared screens (weight buttons, emergency
 * screen, worse/better marks, end screen) read the plan. Patient values and the
 * ward phone still come from the template.
 */
export function predlogaIzNacrta(predloga: Predloga, nacrt: Nacrt): Predloga {
  return {
    ...predloga,
    vprasanja: nacrt.vnosi.flatMap((vn) => (vn.nadaljnje ? [vn.postavka, vn.nadaljnje] : [vn.postavka])).map(kotVprasanje),
    pravila: nacrt.pravila.map((p) => p.pravilo).filter((p): p is Pravilo => p.tip !== "poDnevu"),
  };
}

/** Recovery day of `today` (0 = discharge day). */
export const danOkrevanja = (nacrt: Nacrt, today: IsoDate) => Math.max(0, razlikaDni(nacrt.dejstva.odpust, today));

/**
 * Past check-ins as the engine's history, oldest first, with the items each
 * day flagged (recomputed with `oceniNacrt`, for step-up after an abnormal answer).
 */
export function zgodovinaNacrta(nacrt: Nacrt, vrednosti: PatientValues, history: Checkin[]): DanZgodovine[] {
  const sorted = [...history].sort((a, b) => a.checkin_date.localeCompare(b.checkin_date));
  return sorted.map((c, i) => ({
    dan: danOkrevanja(nacrt, c.checkin_date),
    odgovori: c.answers,
    oznacene: oceniNacrt({
      nacrt,
      vrednosti,
      dan: danOkrevanja(nacrt, c.checkin_date),
      danes: { datum: c.checkin_date, odgovori: c.answers },
      prejsnji: sorted.slice(0, i).map((p) => ({ datum: p.checkin_date, odgovori: p.answers })),
    }).oznacene,
  }));
}

/**
 * Today's question views from the plan. Red flags, `vednoVprasaj` items and
 * stepped-up items are `always` (never copied from yesterday). A follow-up is
 * attached to its parent: on its trigger answers, or on every answer while stepped up.
 */
export function planQuestions(
  predloga: Predloga,
  nacrt: Nacrt,
  today: IsoDate,
  values: PatientValues,
  history: Checkin[],
): QuestionView[] {
  const izbor = izberiDanes(nacrt, danOkrevanja(nacrt, today), zgodovinaNacrta(nacrt, values, history));
  const view = (p: Postavka) => toViews(predloga, [kotVprasanje(p)], values, history)[0];
  return izbor.vprasanja.map((vn: VnosNacrta) => {
    const q = view(vn.postavka);
    const stepped = izbor.nadaljnjeVedno.includes(vn.postavka.id);
    const always = vn.postavka.raven === 0 || vn.postavka.vednoVprasaj || stepped;
    const out = { ...q, always } as QuestionView;
    if (vn.nadaljnje && vn.postavka.nadaljnje && q.kind === "izbira") {
      out.followUp = {
        on: stepped ? q.options.map((o) => o.id) : vn.postavka.nadaljnje.ko,
        question: { ...view(vn.nadaljnje), always },
      } as QuestionView["followUp"];
    }
    return out;
  });
}

/**
 * Ring questions for a plan: the items asked every day of the rehabilitacija
 * (red flags and core trend, daily, no day window). Phase items rotate, so
 * counting them would turn a correctly skipped item red.
 */
export function ringZaNacrt(nacrt: Nacrt): { ids: string[]; notCounting: Record<string, string[]> } {
  const ids = nacrt.vnosi
    .filter((vn) => vn.postavka.raven <= 1 && vn.pogostost === "dnevno" && !vn.aktivniDnevi)
    .map((vn) => vn.postavka.id);
  return { ids, notCounting: {} };
}

/**
 * Leaves out the questions the pill list already answers (T-84), as the
 * template flow does: unless nothing else would be left, and never one whose
 * known answer would trigger its follow-up. `known` is saved with the check-in.
 */
export function brezOdgovorovIzZdravil(questions: QuestionView[], fromPills: CheckinAnswers) {
  const skip = (q: QuestionView) => fromPills[q.id] !== undefined && !followUpFor(q, fromPills[q.id]);
  const asked = questions.filter((q) => !skip(q));
  if (!asked.length) return { questions, known: {} as CheckinAnswers };
  const known: CheckinAnswers = {};
  for (const q of questions) if (skip(q)) known[q.id] = fromPills[q.id];
  return { questions: asked, known };
}
