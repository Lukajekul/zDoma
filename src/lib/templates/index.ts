import { kolkKoleno } from "./kolk-koleno";
import { kopb } from "./kopb";
import { mozganskaKap } from "./mozganska-kap";
import { rakSistemsko } from "./rak-sistemsko";
import { srcePoInfarktu } from "./srce-po-infarktu";
import { srcnoPopuscanje } from "./srcno-popuscanje";
import type { Predloga, PredlogaId, Pravilo } from "./types";

export type * from "./types";
export { NAJVEC_DNEVNIH_VPRASANJ } from "./types";
export * from "./vrednosti";

/** All templates, heart failure first (main template and demo story). */
export const predloge: Record<PredlogaId, Predloga> = {
  "srcno-popuscanje": srcnoPopuscanje,
  "srce-po-infarktu": srcePoInfarktu,
  "kolk-koleno": kolkKoleno,
  kopb,
  "mozganska-kap": mozganskaKap,
  "rak-sistemsko": rakSistemsko,
};

export const seznamPredlog: Predloga[] = Object.values(predloge);

export function jePredlogaId(id: string): id is PredlogaId {
  return id in predloge;
}

export function getPredloga(id: string): Predloga | undefined {
  return jePredlogaId(id) ? predloge[id] : undefined;
}

/**
 * Emergency rule hit by a single answer, if any: the check-in shows the
 * "Pokličite 112" (or ward phone) screen before anything is saved.
 */
export function nujnoPravilo(predloga: Predloga, vprasanjeId: string, odgovorId: string): Pravilo | undefined {
  return predloga.pravila.find(
    (p) =>
      p.tip === "odgovor" &&
      (p.stopnja === "klic112" || p.stopnja === "klicOddelek") &&
      p.vprasanje === vprasanjeId &&
      p.odgovori.includes(odgovorId),
  );
}

/** Fills `{kljuc}` placeholders with the patient's values. Unknown keys stay as they are. */
export function vstaviVrednosti(besedilo: string, vrednosti: Record<string, string | number | undefined>): string {
  return besedilo.replace(/\{(\w+)\}/g, (cel, kljuc: string) => {
    const v = vrednosti[kljuc];
    if (v === undefined || v === "") return cel;
    return typeof v === "number" ? new Intl.NumberFormat("sl-SI").format(v) : v;
  });
}
