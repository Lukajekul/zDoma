// Pure (no I/O): is an answer good or bad, and worse or better than the patient's last
// answer to the same question (T-66, T-91)? Reads only the template's rules and
// option order, never condition-specific ids.
import type { Predloga, Stopnja, VprasanjeIzbira, VprasanjeTeza } from "@/lib/templates";
import type { Checkin } from "@/lib/types";

/**
 * Mark on one answer button (T-91): `tone` says whether the answer is good (blue)
 * or bad (red); `word` compares it with the last answer when there is one
 * ("boljše" / "slabše" / "enako"), otherwise repeats the tone ("dobro" / "slabo").
 */
export type Tone = "dobro" | "slabo";
export type Mark = { tone: Tone; word: "boljse" | "slabse" | "enako" | Tone };

const RANK: Record<Stopnja, number> = { opomba: 0, opozorilo: 1, klicOddelek: 2, klic112: 2 };

/** Newest answer to this question in the history, if any. */
export function lastAnswer(questionId: string, history: Checkin[]): string | number | undefined {
  const sorted = [...history].sort((a, b) => b.checkin_date.localeCompare(a.checkin_date));
  for (const c of sorted) {
    const v = c.answers[questionId];
    if (v !== undefined && v !== null) return v as string | number;
  }
  return undefined;
}

/**
 * Severity per option: the strongest rule that flags it. The option order breaks
 * ties when the template says it is a severity order (a "narascaVDneh" rule), or
 * when the flagged options all sit at the end of the list (e.g. Ne / Pri hoji / Leže).
 * Options that don't count as an answer ("Nimam ga") get no severity.
 */
export function optionSeverity(predloga: Predloga, q: VprasanjeIzbira): Map<string, number> {
  const rules = predloga.pravila.filter((p) => p.vprasanje === q.id);
  const ranks = q.odgovori.map((o) =>
    Math.max(0, ...rules.map((p) => ("odgovori" in p && p.odgovori.includes(o.id) ? RANK[p.stopnja] : 0))),
  );
  const ordered =
    rules.some((p) => p.tip === "narascaVDneh") ||
    (ranks.some((r) => r > 0) && ranks.every((r, i) => i === 0 || r >= ranks[i - 1]));
  const out = new Map<string, number>();
  q.odgovori.forEach((o, i) => {
    if (o.steje !== false) out.set(o.id, ranks[i] * 1000 + (ordered ? i : 0));
  });
  return out;
}

/**
 * Mark per option of a choice question. The least severe options are good, the
 * rest bad; against the last answer the word says better, worse or the same.
 * No marks when the template has no rule for this question (nothing to go by).
 */
export function choiceChanges(predloga: Predloga, q: VprasanjeIzbira, last: unknown): Record<string, Mark> {
  const sev = optionSeverity(predloga, q);
  const values = [...sev.values()];
  const out: Record<string, Mark> = {};
  if (values.length < 2 || values.every((v) => v === values[0])) return out;
  const best = Math.min(...values);
  const before = typeof last === "string" ? sev.get(last) : undefined;
  for (const [id, s] of sev) {
    const tone: Tone = s === best ? "dobro" : "slabo";
    if (before === undefined) out[id] = { tone, word: tone };
    else if (s > before) out[id] = { tone: "slabo", word: "slabse" };
    else if (s < before) out[id] = { tone: "dobro", word: "boljse" };
    else out[id] = { tone, word: "enako" };
  }
  return out;
}

/**
 * Mark per weight button against the last weight. Only when the template flags a
 * rising number (porastVDneh / nadVrednostjo): up is worse, down is better unless it
 * goes below the patient's own value (e.g. dry weight). The same weight is good,
 * or bad while it is still over the template's limit above that value.
 */
export function numberChanges(
  predloga: Predloga,
  q: VprasanjeTeza,
  options: number[],
  last: unknown,
  target?: number,
): (Mark | null)[] {
  const rules = predloga.pravila.filter((p) => p.vprasanje === q.id);
  const rising = rules.some((p) => p.tip === "porastVDneh" || p.tip === "nadVrednostjo");
  const over = rules.find((p) => p.tip === "nadVrednostjo");
  const tooHigh = (v: number) => !!over && target !== undefined && v - target > over.vecKot;
  return options.map((v) => {
    if (!rising || typeof last !== "number") return null;
    // A button within half a step of the last weight is "the same".
    if (Math.abs(v - last) < q.korak / 2) return { tone: tooHigh(v) ? "slabo" : "dobro", word: "enako" };
    if (v > last) return { tone: "slabo", word: "slabse" };
    return target === undefined || v >= target ? { tone: "dobro", word: "boljse" } : null;
  });
}
