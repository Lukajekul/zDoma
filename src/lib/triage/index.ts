// Triage engine (AGENTS.md §5a): pure functions, no I/O, no condition-specific code.
// Everything condition-specific lives in the template data (src/lib/templates/).
export { LACE_TVEGANJE_BESEDILO, laceScore, laceTveganje } from "./lace";
export type { LaceRezultat, LaceTveganje } from "./lace";
export { oceniPregled, statusIzRazlogov } from "./ocena";
export { oceniOpazanje, vprasajSkrb } from "./opazanje";
export type { OcenaOpazanja } from "./opazanje";
export type { OcenaPregleda, OcenaVhod, Razlog } from "./ocena";
export { oceniPravilo } from "./pravila";
export type { DanOdgovori, Kontekst } from "./pravila";
export { dniBesedilo, tedenskiPovzetek } from "./povzetek";
export type { PovzetekVhod, TedenskiPovzetek } from "./povzetek";
export { razlikaDni } from "./datumi";

/** Status as words, never colour alone (AGENTS.md §7). */
export const STATUS_BESEDILO = {
  zeleno: "Zeleno – vse v redu",
  rumeno: "Rumeno – sestra bo pogledala",
  rdece: "Rdeče – potrebna pozornost",
} as const;
export {
  oceniPrevzem,
  prevzemBesediloPacient,
  prevzemBesediloZadolzenec,
  prevzemDosegel,
  prevzemRazlog,
  PREVZEM_NASTAVITVE,
} from "./prevzem";
export type { PrevzemNastavitve, PrevzemOcena, PrevzemStopnja, PrevzemZdravilo } from "./prevzem";
export { DRUGA_TEZAVA_BESEDILO, dodajPacientoveOznake, preskokRazlog } from "./preskok";
