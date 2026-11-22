// Pure (no I/O): would an answer be worse or better than the patient's last
// answer to the same question (T-66)? Reads only the template's rules and
// option order, never condition-specific ids.
import type { Predloga, Stopnja, VprasanjeIzbira, VprasanjeTeza } from "@/lib/templates";
import type { Checkin } from "@/lib/types";

export type Change = "slabse" | "boljse";

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

/** Worse or better than the last answer, per option of a choice question. */
export function choiceChanges(predloga: Predloga, q: VprasanjeIzbira, last: unknown): Record<string, Change> {
  const sev = optionSeverity(predloga, q);
  const before = typeof last === "string" ? sev.get(last) : undefined;
  const out: Record<string, Change> = {};
  if (before === undefined) return out;
  for (const [id, s] of sev) {
    if (s > before) out[id] = "slabse";
    else if (s < before) out[id] = "boljse";
  }
  return out;
}

/**
 * Worse or better than the last weight, per weight button. Only when the template
 * flags a rising number (porastVDneh / nadVrednostjo): up is worse, down is better
 * unless it goes below the patient's own value (e.g. dry weight).
 */
export function numberChanges(
  predloga: Predloga,
  q: VprasanjeTeza,
  options: number[],
  last: unknown,
  target?: number,
): (Change | null)[] {
  const rising = predloga.pravila.some(
    (p) => p.vprasanje === q.id && (p.tip === "porastVDneh" || p.tip === "nadVrednostjo"),
  );
  return options.map((v) => {
    // A button within half a step of the last weight is "the same".
    if (!rising || typeof last !== "number" || Math.abs(v - last) < q.korak / 2) return null;
    if (v > last) return "slabse";
    return target === undefined || v >= target ? "boljse" : null;
  });
}
