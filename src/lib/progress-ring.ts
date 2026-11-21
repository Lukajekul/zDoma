// Progress ring data (AGENTS.md §5a): one slice per day of the rehabilitacija,
// each split by that day's questions. Pure, no I/O, no condition-specific code.
import type { Predloga } from "@/lib/templates";
import type { CheckinAnswers, IsoDate, Rehabilitacija } from "@/lib/types";

/** answered = green, missed = red (past day, never turns green), future = light grey. */
export type RingPart = "answered" | "missed" | "future";

export type RingDay = { date: IsoDate; parts: RingPart[] };

export type RingData = {
  days: RingDay[];
  /** Answered questions ÷ questions due so far (past days + today once done), 0–1. */
  answeredShare: number;
  doneDays: number;
  missedDays: number;
  /** Days still to come, today included while today's check-in isn't done. */
  leftDays: number;
};

const DAY_MS = 86_400_000;
const addDays = (d: IsoDate, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);

/** Daily questions chosen for the rehabilitacija (max 6) and the answers that don't count ("Nimam ga"). */
export function ringQuestions(predloga: Predloga, rehab: Pick<Rehabilitacija, "questions">) {
  const chosen = rehab.questions.length
    ? predloga.vprasanja.filter((q) => rehab.questions.includes(q.id))
    : predloga.vprasanja.filter((q) => q.privzetoIzbrano);
  const daily = chosen.filter((q) => q.pogostost === "dnevno").slice(0, 6);
  const notCounting: Record<string, string[]> = {};
  for (const q of daily) {
    if (q.tip === "izbira") notCounting[q.id] = q.odgovori.filter((o) => o.steje === false).map((o) => o.id);
  }
  return { ids: daily.map((q) => q.id), notCounting };
}

export function progressRing(input: {
  startDate: IsoDate;
  endDate: IsoDate;
  today: IsoDate;
  questionIds: string[];
  notCounting: Record<string, string[]>;
  checkins: { checkin_date: IsoDate; answers: CheckinAnswers }[];
}): RingData {
  const perDay = Math.max(input.questionIds.length, 1);
  const byDate = new Map(input.checkins.map((c) => [c.checkin_date, c.answers]));
  const days: RingDay[] = [];
  let answered = 0;
  let due = 0;
  let doneDays = 0;
  let missedDays = 0;
  let leftDays = 0;

  for (let date = input.startDate; date <= input.endDate; date = addDays(date, 1)) {
    const answers = byDate.get(date);
    if (answers) {
      const ok = input.questionIds.filter((id) => {
        const a = answers[id];
        return a !== undefined && !(input.notCounting[id] ?? []).includes(String(a));
      }).length;
      const okParts = input.questionIds.length ? ok : 1;
      days.push({ date, parts: Array.from({ length: perDay }, (_, i) => (i < okParts ? "answered" : "missed")) });
      answered += okParts;
      due += perDay;
      doneDays++;
    } else if (date < input.today) {
      days.push({ date, parts: Array(perDay).fill("missed") });
      due += perDay;
      missedDays++;
    } else {
      days.push({ date, parts: Array(perDay).fill("future") });
      leftDays++;
    }
  }
  return { days, answeredShare: due ? answered / due : 0, doneDays, missedDays, leftDays };
}
