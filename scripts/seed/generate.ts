// Pure generation of check-in histories from a template. No condition-specific
// code: "normal" and "flag" answers are derived from the template's own rules,
// and every day is triaged with the real engine (src/lib/triage).
import { normalAnswer, warningAnswer } from "@/lib/demo/answers";
import type { Predloga } from "@/lib/templates";
import { oceniPregled, razlikaDni, type DanOdgovori } from "@/lib/triage";
import type { CheckinAnswers, IsoDate, PatientValues, TriageStatus } from "@/lib/types";
import type { rng } from "./data";

type Rng = ReturnType<typeof rng>;

export function addDays(date: IsoDate, n: number): IsoDate {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function patientValues(p: Predloga, r: Rng, override: PatientValues = {}): PatientValues {
  const v: PatientValues = {};
  for (const x of p.vrednostiPacienta) {
    if (x.privzeto !== undefined) v[x.kljuc] = x.privzeto;
    else if (x.tip === "stevilo") v[x.kljuc] = r.int(58, 96);
    else if (x.tip === "tlak") v[x.kljuc] = "130/80";
    else if (x.tip === "zdravilo") v[x.kljuc] = p.zdravila[0]?.ime ?? "zdravilo";
    else if (x.tip === "telefon") v[x.kljuc] = "03 000 00 00";
  }
  return { ...v, ...override };
}

export interface PlannedCheckin {
  date: IsoDate;
  answers: CheckinAnswers;
  status: TriageStatus;
  reasons: string[];
}

export interface PlanInput {
  predloga: Predloga;
  questions: string[];
  values: PatientValues;
  start: IsoDate;
  /** Last day to plan (today, or the end date of a finished rehab). */
  last: IsoDate;
  /** Target status on the last day. */
  profil: TriageStatus;
  /** No check-in on the last day ("Brez pregleda danes"). */
  skipLast: boolean;
  r: Rng;
  /** Fixed answers by date, e.g. the demo story (wins over generated ones). */
  fixed?: Record<IsoDate, CheckinAnswers>;
}

export function planCheckins(i: PlanInput): PlannedCheckin[] {
  const qs = i.predloga.vprasanja.filter((q) => i.questions.includes(q.id));
  const weightQ = qs.find((q) => q.tip === "teza");
  const hasWeightRise = i.predloga.pravila.some((r) => r.tip === "porastVDneh" && r.vprasanje === weightQ?.id);
  const base = Number(Object.values(i.values).find((v) => typeof v === "number") ?? 75);

  // Questions flagged on the last day: 1 for rumeno, 2 for rdece.
  const candidates = qs.filter((q) => warningAnswer(i.predloga, q) || (q === weightQ && hasWeightRise));
  const nFlags = i.profil === "rdece" ? 2 : i.profil === "rumeno" ? 1 : 0;
  const flagged = new Set(shuffle(candidates, i.r).slice(0, nFlags).map((q) => q.id));
  const riseFrom = flagged.has(weightQ?.id ?? "") ? addDays(i.last, -3) : null;

  const out: PlannedCheckin[] = [];
  const history: DanOdgovori[] = [];
  let day = 0;
  for (let date = i.start; date <= i.last; date = addDays(date, 1), day++) {
    const isLast = date === i.last;
    if (isLast && i.skipLast) break;
    if (!isLast && day > 0 && i.r.chance(0.07)) continue; // a missed day now and then
    const randomFlag = !isLast && i.r.chance(0.04) ? i.r.pick(candidates) : undefined;

    const answers: CheckinAnswers = {};
    for (const q of qs) {
      if (q.pogostost === "tedensko" && day % 7 !== 0 && !isLast) continue;
      if (q.tip === "teza") {
        // Normal days sit at or just below dry weight (any weight above it is flagged, see T-43).
        let w = base - i.r.next() * 0.6;
        // Flagged weight: +0,8 / +1,7 / +2,5 kg over the last 3 days ("Teža +2,5 kg v 3 dneh").
        if (riseFrom && date > riseFrom) w = base + [0.8, 1.7, 2.5][Math.min(razlikaDni(riseFrom, date), 3) - 1];
        answers[q.id] = Math.round(w * 10) / 10;
        continue;
      }
      const flag = (isLast && flagged.has(q.id)) || randomFlag?.id === q.id;
      answers[q.id] = (flag && warningAnswer(i.predloga, q)) || normalAnswer(i.predloga, q) || "";
    }
    Object.assign(answers, i.fixed?.[date]);

    const o = oceniPregled({
      predloga: i.predloga,
      vrednosti: i.values,
      danes: { datum: date, odgovori: answers },
      prejsnji: history,
      izbranaVprasanja: i.questions,
    });
    history.push({ datum: date, odgovori: answers });
    out.push({ date, answers, status: o.status, reasons: o.razlogi.map((x) => x.besedilo) });
  }
  return out;
}

function shuffle<T>(xs: T[], r: Rng): T[] {
  const a = [...xs];
  for (let k = a.length - 1; k > 0; k--) {
    const j = Math.floor(r.next() * (k + 1));
    [a[k], a[j]] = [a[j], a[k]];
  }
  return a;
}
