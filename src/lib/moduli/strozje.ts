// When two modules carry the same rule id with different thresholds, the stricter one wins.
import type { Stopnja } from "@/lib/templates";
import type { PraviloModula } from "./types";

const STOPNJA_RANG: Record<Stopnja, number> = { opomba: 0, opozorilo: 1, klicOddelek: 2, klic112: 3 };

/** A number where lower = fires sooner, for rules of the same type. */
function prag(p: PraviloModula): number {
  switch (p.tip) {
    case "porastVDneh":
    case "nadVrednostjo":
      return p.vecKot;
    case "zaporedniDnevi":
    case "narascaVDneh":
      return p.dni;
    case "poDnevu":
      return p.poDnevu;
    case "odgovor":
      return -p.odgovori.length;
  }
}

/** The stricter of two rules: higher severity first, then the lower threshold. Ties keep `b` (earlier, higher-priority module). */
export function strozje(a: PraviloModula, b: PraviloModula): PraviloModula {
  const s = STOPNJA_RANG[a.stopnja] - STOPNJA_RANG[b.stopnja];
  if (s !== 0) return s > 0 ? a : b;
  if (a.tip !== b.tip) return b;
  return prag(a) < prag(b) ? a : b;
}
