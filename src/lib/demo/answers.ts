// Answers derived from a template's own rules (used by the seed and /demo).
// No condition-specific code: "normal" = an option no rule reacts to.
import type { Predloga, Vprasanje } from "@/lib/templates";

/** Answer ids any rule reacts to (warnings and emergencies). */
function flaggedIds(p: Predloga, qId: string): Set<string> {
  const ids = new Set<string>();
  for (const r of p.pravila) {
    if (r.vprasanje === qId && (r.tip === "odgovor" || r.tip === "zaporedniDnevi")) r.odgovori.forEach((o) => ids.add(o));
  }
  return ids;
}

/** First option no rule reacts to (and that counts as answered). Null for weight questions. */
export function normalAnswer(p: Predloga, q: Vprasanje): string | null {
  if (q.tip !== "izbira") return null;
  const bad = flaggedIds(p, q.id);
  return (q.odgovori.find((o) => !bad.has(o.id) && o.steje !== false) ?? q.odgovori[0]).id;
}

/** An option that raises a warning, never an emergency (emergency answers are never saved). */
export function warningAnswer(p: Predloga, q: Vprasanje): string | null {
  const rule = p.pravila.find((r) => r.vprasanje === q.id && r.tip === "odgovor" && r.stopnja === "opozorilo");
  return rule && rule.tip === "odgovor" ? rule.odgovori[0] : null;
}
