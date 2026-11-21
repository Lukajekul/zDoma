// Pure check-in planning (no I/O): which questions today, their texts with the
// patient's own values, emergency answers, and "Enako kot včeraj". Generic:
// reads only the template, never condition-specific ids.
import { NAJVEC_DNEVNIH_VPRASANJ, vstaviVrednosti, type Predloga, type Vprasanje } from "@/lib/templates";
import type { Checkin, CheckinAnswers, IsoDate, PatientValues, Rehabilitacija } from "@/lib/types";
import { addDays } from "./schedule";

export type Emergency = { kind: "klic112" | "klicOddelek"; reason: string; phone?: string };

/** Serializable question for the client flow. */
export type QuestionView =
  | {
      id: string;
      kind: "izbira";
      text: string;
      always: boolean;
      photo: boolean;
      options: { id: string; text: string; emergency?: Emergency }[];
    }
  | { id: string; kind: "teza"; text: string; always: true; photo: false; options: number[] };

const WEEKLY_GAP_DAYS = 7;

/** Template questions chosen for this patient that are due today, at most 6. */
export function dueQuestions(predloga: Predloga, rehab: Pick<Rehabilitacija, "questions">, history: Checkin[], today: IsoDate) {
  const chosen = rehab.questions.length
    ? predloga.vprasanja.filter((q) => rehab.questions.includes(q.id))
    : predloga.vprasanja.filter((q) => q.privzetoIzbrano);
  const due = chosen.filter((q) => {
    if (q.pogostost !== "tedensko") return true;
    const since = addDays(today, -(WEEKLY_GAP_DAYS - 1));
    return !history.some((c) => c.checkin_date >= since && c.answers[q.id] !== undefined);
  });
  // Always-asked questions first: on an "Enako kot včeraj" day they are all that's left.
  return [...due.filter((q) => q.vednoVprasaj), ...due.filter((q) => !q.vednoVprasaj)].slice(0, NAJVEC_DNEVNIH_VPRASANJ);
}

/** Last weight answer (newest check-in first), else the patient's target value. */
export function lastNumber(questionId: string, history: Checkin[], fallback?: number): number | undefined {
  const sorted = [...history].sort((a, b) => b.checkin_date.localeCompare(a.checkin_date));
  for (const c of sorted) {
    const v = c.answers[questionId];
    if (typeof v === "number") return v;
  }
  return fallback;
}

/** Patient value a weight is compared to (from a `nadVrednostjo` rule on that question), e.g. dry weight. */
export function targetFor(predloga: Predloga, questionId: string, values: PatientValues) {
  const rule = predloga.pravila.find((p) => p.tip === "nadVrednostjo" && p.vprasanje === questionId);
  const raw = rule?.tip === "nadVrednostjo" ? values[rule.vrednost] : undefined;
  const n = typeof raw === "number" ? raw : Number(String(raw ?? "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function emergencyFor(predloga: Predloga, q: Vprasanje, optionId: string, values: PatientValues): Emergency | undefined {
  const rule = predloga.pravila.find(
    (p) =>
      p.tip === "odgovor" &&
      (p.stopnja === "klic112" || p.stopnja === "klicOddelek") &&
      p.vprasanje === q.id &&
      p.odgovori.includes(optionId),
  );
  if (!rule || (rule.stopnja !== "klic112" && rule.stopnja !== "klicOddelek")) return undefined;
  const phoneKey = predloga.vrednostiPacienta.find((v) => v.tip === "telefon")?.kljuc;
  return {
    kind: rule.stopnja,
    reason: vstaviVrednosti(rule.razlog, values),
    phone: phoneKey ? String(values[phoneKey] ?? "") || undefined : undefined,
  };
}

/** Question views with the patient's values filled in. Weight gets ±2 steps around the last weight. */
export function toViews(predloga: Predloga, questions: Vprasanje[], values: PatientValues, history: Checkin[]): QuestionView[] {
  return questions.map((q) => {
    const text = vstaviVrednosti(q.besedilo, values);
    if (q.tip === "teza") {
      const center = lastNumber(q.id, history, targetFor(predloga, q.id, values)) ?? 70;
      const base = Math.round(center / q.korak) * q.korak;
      const options = [-2, -1, 0, 1, 2].map((i) => Math.round((base + i * q.korak) * 10) / 10);
      return { id: q.id, kind: "teza", text, always: true, photo: false, options };
    }
    return {
      id: q.id,
      kind: "izbira",
      text,
      always: q.vednoVprasaj,
      photo: !!q.fotografija,
      options: q.odgovori.map((o) => ({
        id: o.id,
        text: vstaviVrednosti(o.besedilo, values),
        emergency: emergencyFor(predloga, q, o.id, values),
      })),
    };
  });
}

/**
 * Yesterday's check-in can be repeated with one tap when it was green and
 * answered every question that today's "Enako kot včeraj" would fill.
 */
export function sameAsYesterdaySource(questions: QuestionView[], history: Checkin[], today: IsoDate): Checkin | undefined {
  const y = history.find((c) => c.checkin_date === addDays(today, -1));
  if (!y || y.triage_status !== "zeleno") return undefined;
  const filled = questions.filter((q) => !q.always);
  if (!filled.length || filled.some((q) => y.answers[q.id] === undefined)) return undefined;
  return y;
}

/** Copies yesterday's answers for every question not asked always. */
export function copyFromYesterday(questions: QuestionView[], yesterday: Checkin): CheckinAnswers {
  const out: CheckinAnswers = {};
  for (const q of questions) if (!q.always) out[q.id] = yesterday.answers[q.id];
  return out;
}

/** Checks a submitted answer against the question; returns the clean value or undefined. */
export function cleanAnswer(q: QuestionView, value: unknown): string | number | undefined {
  if (q.kind === "teza") {
    const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
    return Number.isFinite(n) && n >= 20 && n <= 300 ? Math.round(n * 10) / 10 : undefined;
  }
  return typeof value === "string" && q.options.some((o) => o.id === value) ? value : undefined;
}
