// T-31: medicines not picked up at the pharmacy after discharge. Generic, works
// for every template. "The app chases the patient": first the patient is
// reminded, then the zadolženec, and only then staff get an alert with a reason.
import type { IsoDate, MedicationChange } from "@/lib/types";
import { razlikaDni } from "./datumi";

/** Days after discharge at which each step starts. Settings, to confirm (IDEA.md open questions). */
export interface PrevzemNastavitve {
  opomniPacienta: number;
  obvestiZadolzenca: number;
  opozoriOsebje: number;
  /** Which medicines need a new pick-up: unchanged ones the patient usually has at home. */
  preveri: MedicationChange[];
}

export const PREVZEM_NASTAVITVE: PrevzemNastavitve = {
  opomniPacienta: 2,
  obvestiZadolzenca: 3,
  opozoriOsebje: 3,
  preveri: ["novo", "spremenjeno"],
};

export type PrevzemStopnja = "v-redu" | "caka" | "pacient" | "zadolzenec" | "osebje";

export interface PrevzemZdravilo {
  id: string;
  name: string;
  change: MedicationChange;
  /** Pick-up date from eRecept, null = not picked up yet. */
  picked_up_at: IsoDate | null;
}

export interface PrevzemOcena {
  zdraviloId: string;
  ime: string;
  /** Days since discharge. */
  dni: number;
  /** Highest step reached; each step includes the ones before it. */
  stopnja: PrevzemStopnja;
}

/** Evaluates each medicine that needs picking up. Pure: pass discharge date and today (Europe/Ljubljana). */
export function oceniPrevzem(
  zdravila: PrevzemZdravilo[],
  odpust: IsoDate,
  danes: IsoDate,
  n: PrevzemNastavitve = PREVZEM_NASTAVITVE,
): PrevzemOcena[] {
  const dni = Math.max(0, razlikaDni(odpust, danes));
  return zdravila
    .filter((z) => n.preveri.includes(z.change))
    .map((z) => ({ zdraviloId: z.id, ime: z.name, dni, stopnja: stopnja(z, dni, n) }));
}

function stopnja(z: PrevzemZdravilo, dni: number, n: PrevzemNastavitve): PrevzemStopnja {
  if (z.picked_up_at) return "v-redu";
  if (dni >= n.opozoriOsebje) return "osebje";
  if (dni >= n.obvestiZadolzenca) return "zadolzenec";
  if (dni >= n.opomniPacienta) return "pacient";
  return "caka";
}

const VRSTNI_RED: PrevzemStopnja[] = ["v-redu", "caka", "pacient", "zadolzenec", "osebje"];

/** True when `ocena` has reached `korak` (e.g. the zadolženec is warned from "zadolzenec" on). */
export function prevzemDosegel(ocena: Pick<PrevzemOcena, "stopnja">, korak: PrevzemStopnja): boolean {
  return VRSTNI_RED.indexOf(ocena.stopnja) >= VRSTNI_RED.indexOf(korak);
}

/** Patient reminder: "Zdravila Furosemid še niste prevzeli v lekarni." */
export function prevzemBesediloPacient(imena: string[]): string {
  return `Zdravila ${seznam(imena)} še niste prevzeli v lekarni.`;
}

/**
 * For the zadolženec, without medicine names, so it can also go out by email/SMS:
 * "Janez: zdravila še niso prevzeta v lekarni." (gender-neutral wording).
 */
export function prevzemBesediloZadolzenec(ime: string): string {
  return `${ime}: zdravila še niso prevzeta v lekarni.`;
}

/** Staff alert reason: "Furosemid ni prevzet 3 dni po odpustu". */
export function prevzemRazlog(o: Pick<PrevzemOcena, "ime" | "dni">): string {
  return `${o.ime} ni prevzet ${o.dni} ${o.dni === 1 ? "dan" : o.dni === 2 ? "dneva" : "dni"} po odpustu`;
}

function seznam(imena: string[]): string {
  return imena.length <= 1 ? (imena[0] ?? "") : `${imena.slice(0, -1).join(", ")} in ${imena.at(-1)}`;
}
