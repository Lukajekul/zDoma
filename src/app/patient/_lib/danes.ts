// "Danes": today's next action, one at a time (AGENTS.md §5a). Pure, no I/O.
import type { TimeOfDay } from "@/lib/types";
import { TIME_ORDER, type Dose } from "./schedule";

/** When a time-of-day slot's pills become due (minutes after midnight, Europe/Ljubljana). Product setting. */
export const SLOT_START: Record<TimeOfDay, number> = { zjutraj: 6 * 60, opoldne: 11 * 60, zvecer: 17 * 60, ponoci: 20 * 60 };

/** "jutranje tablete", "večerne tablete" … */
export const SLOT_ADJ: Record<TimeOfDay, string> = {
  zjutraj: "jutranje",
  opoldne: "opoldanske",
  zvecer: "večerne",
  ponoci: "nočne",
};

export type DanesInput = {
  checkinDone: boolean;
  hasQuestions: boolean;
  /** First question is the weight ("Stopite na tehtnico"). */
  startsWithWeight: boolean;
  doseGroups: { time: TimeOfDay; doses: Dose[] }[];
  exercises: { title: string; remaining: number }[];
  nowMinutes: number;
};

export type DanesAction =
  | { kind: "checkin"; weight: boolean }
  | { kind: "pills"; time: TimeOfDay; doses: { name: string; dose: string }[] }
  | { kind: "exercise"; title: string }
  | { kind: "later"; time: TimeOfDay; at: number }
  | { kind: "done" };

const open = (g: { doses: Dose[] }) => g.doses.filter((d) => !d.log);

/** The single next thing to do now: check-in → pills due now → exercise → wait for later pills → done. */
export function nextAction(i: DanesInput): DanesAction {
  if (!i.checkinDone && i.hasQuestions) return { kind: "checkin", weight: i.startsWithWeight };

  const ordered = [...i.doseGroups].sort((a, b) => TIME_ORDER.indexOf(a.time) - TIME_ORDER.indexOf(b.time));
  const dueNow = ordered.find((g) => SLOT_START[g.time] <= i.nowMinutes && open(g).length);
  if (dueNow) {
    return {
      kind: "pills",
      time: dueNow.time,
      doses: open(dueNow).map((d) => ({ name: d.medication.name, dose: d.medication.dose })),
    };
  }

  const ex = i.exercises.find((e) => e.remaining > 0);
  if (ex) return { kind: "exercise", title: ex.title };

  const later = ordered.find((g) => SLOT_START[g.time] > i.nowMinutes && open(g).length);
  if (later) return { kind: "later", time: later.time, at: SLOT_START[later.time] };
  return { kind: "done" };
}

/** Minutes after midnight in Europe/Ljubljana. */
export function nowMinutesLjubljana(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Ljubljana",
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

/** 1020 → "17:00" */
export const minutesToTime = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
