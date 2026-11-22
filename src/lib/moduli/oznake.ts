// Flags for one check-in of a composed plan: own baseline (weight trend),
// expected trajectory (fever after day 7) and follow-up answers. Every flag
// carries its reason, the module that set it and the source.
import { vstaviVrednosti } from "@/lib/templates";
import type { Predloga, Vir, Vprasanje } from "@/lib/templates";
import { oceniPravilo, statusIzRazlogov, type DanOdgovori, type Razlog } from "@/lib/triage";
import type { PatientValues, TriageStatus } from "@/lib/types";
import type { Nacrt } from "./sestavi";
import type { Postavka, PraviloPoDnevu } from "./types";

/** Shown with every flag: a prompt for a clinician, not a diagnosis. */
export const OZNAKA_OPOMBA =
  "Opozorilo je poziv, da zdravstveno osebje pogleda podatke, ne diagnoza. Meje so zgled in še niso klinično potrjene.";

export interface Oznaka extends Razlog {
  /** Module whose threshold set this flag, and every module that had the rule. */
  modul: string;
  moduli: string[];
  /** Source of the rule and of the question. */
  vir: Vir;
  virVprasanja: Vir;
}

export interface OcenaNacrta {
  status: TriageStatus;
  /** Emergencies first. */
  oznake: Oznaka[];
  opombe: Oznaka[];
  nujno?: Oznaka;
  /** Item ids with an alert today: feed into `DanZgodovine.oznacene` for step-up. */
  oznacene: string[];
}

export interface OcenaNacrtaVhod {
  nacrt: Nacrt;
  vrednosti: PatientValues;
  /** Recovery day of `danes` (0 = discharge day). */
  dan: number;
  danes: DanOdgovori;
  prejsnji: DanOdgovori[];
}

function kotVprasanje(p: Postavka): Vprasanje {
  return { ...p, pogostost: "dnevno", privzetoIzbrano: true } as Vprasanje;
}

function oceniPoDnevu(p: PraviloPoDnevu, vhod: OcenaNacrtaVhod): string | undefined {
  const a = vhod.danes.odgovori[p.vprasanje];
  if (a === undefined || vhod.dan <= p.poDnevu || !p.odgovori.includes(String(a))) return undefined;
  return vstaviVrednosti(p.razlog, { ...vhod.vrednosti, dan: vhod.dan });
}

const jeNujno = (o: Oznaka) => o.stopnja === "klic112" || o.stopnja === "klicOddelek";

export function oceniNacrt(vhod: OcenaNacrtaVhod): OcenaNacrta {
  const postavke = vhod.nacrt.vnosi.flatMap((vn) => (vn.nadaljnje ? [vn.postavka, vn.nadaljnje] : [vn.postavka]));
  // oceniPravilo only reads the questions of the template it is given.
  const predloga = { vprasanja: postavke.map(kotVprasanje) } as Predloga;
  const kontekst = { predloga, vrednosti: vhod.vrednosti, danes: vhod.danes, prejsnji: vhod.prejsnji };

  const vse: Oznaka[] = [];
  for (const { pravilo, modul, moduli } of vhod.nacrt.pravila) {
    const besedilo = pravilo.tip === "poDnevu" ? oceniPoDnevu(pravilo, vhod) : oceniPravilo(pravilo, kontekst);
    if (!besedilo) continue;
    const vprasanje = postavke.find((p) => p.id === pravilo.vprasanje)!;
    vse.push({
      praviloId: pravilo.id,
      vprasanjeId: pravilo.vprasanje,
      stopnja: pravilo.stopnja,
      besedilo,
      modul,
      moduli,
      vir: pravilo.vir,
      virVprasanja: vprasanje.vir,
    });
  }
  const oznake = vse.filter((o) => o.stopnja !== "opomba").sort((a, b) => Number(jeNujno(b)) - Number(jeNujno(a)));
  return {
    status: statusIzRazlogov(oznake),
    oznake,
    opombe: vse.filter((o) => o.stopnja === "opomba"),
    nujno: oznake.find(jeNujno),
    oznacene: [...new Set(oznake.map((o) => o.vprasanjeId))],
  };
}
