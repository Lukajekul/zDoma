// LACE index for readmission risk at discharge.
// Source: van Walraven C et al. Derivation and validation of an index to predict
// early death or unplanned readmission after discharge from hospital to the
// community. CMAJ 2010;182(6):551–557. doi:10.1503/cmaj.091117
import type { LaceInput } from "@/lib/types";

export interface LaceRezultat {
  l: number;
  a: number;
  c: number;
  e: number;
  /** 0–19 */
  skupaj: number;
}

/** L: length of stay in days. */
function tockeL(dni: number): number {
  if (dni < 1) return 0;
  if (dni <= 3) return Math.floor(dni);
  if (dni <= 6) return 4;
  if (dni <= 13) return 5;
  return 7;
}

/** C: Charlson comorbidity index. */
function tockeC(charlson: number): number {
  if (charlson >= 4) return 5;
  return Math.max(0, Math.floor(charlson));
}

/** E: emergency department visits in the last 6 months. */
function tockeE(obiski: number): number {
  return Math.min(4, Math.max(0, Math.floor(obiski)));
}

export function laceScore(input: LaceInput): LaceRezultat {
  const l = tockeL(input.l);
  const a = input.a ? 3 : 0;
  const c = tockeC(input.c);
  const e = tockeE(input.e);
  return { l, a, c, e, skupaj: l + a + c + e };
}

export type LaceTveganje = "nizko" | "srednje" | "visoko";

/**
 * Risk band. ≥10 = high is the cut-off most hospitals use; 0–4 / 5–9 / ≥10 are
 * common bands but not from the original paper. ⚠️ to confirm (T-43).
 */
export function laceTveganje(skupaj: number): LaceTveganje {
  if (skupaj >= 10) return "visoko";
  if (skupaj >= 5) return "srednje";
  return "nizko";
}

export const LACE_TVEGANJE_BESEDILO: Record<LaceTveganje, string> = {
  nizko: "Nizko tveganje za ponovni sprejem",
  srednje: "Srednje tveganje za ponovni sprejem",
  visoko: "Visoko tveganje za ponovni sprejem",
};
