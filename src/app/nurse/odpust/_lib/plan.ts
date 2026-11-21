// Pure helpers for opening a rehabilitacija (T-21). No I/O, no condition-specific code.
import type { Predloga } from "@/lib/templates";
import type { IsoDate, MedicationChange, Nadomescanje, Teren, TimeOfDay } from "@/lib/types";

export const TIME_LABEL: Record<TimeOfDay, string> = {
  zjutraj: "zjutraj",
  opoldne: "opoldne",
  zvecer: "zvečer",
  ponoci: "ponoči",
};

/** A medicine line in the wizard. `previousDose` = from the earlier rehabilitacija ("already takes"). */
export type MedLine = {
  key: string;
  name: string;
  activeSubstance: string | null;
  purpose: string | null;
  /** Usual doses from the template (staff only), may be empty. */
  doseOptions: string[];
  dose: string;
  times: TimeOfDay[];
  selected: boolean;
  previousDose: string | null;
  /** Added with "Dodaj zdravilo". */
  added?: boolean;
  /** Taken as needed: no fixed time of day. */
  asNeeded?: boolean;
  /** Staff-only "when it applies". */
  when?: string;
};

export const addDaysIso = (d: IsoDate, n: number) =>
  new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

/** Default end date: start + template length − 1 (inclusive). */
export const defaultEndDate = (predloga: Predloga, start: IsoDate) => addDaysIso(start, predloga.privzetoTrajanjeDni - 1);

/** Patient values pre-filled with the template's defaults (e.g. ciljniTlak 130/80). */
export function defaultValues(predloga: Predloga): Record<string, string> {
  return Object.fromEntries(predloga.vrednostiPacienta.map((v) => [v.kljuc, v.privzeto === undefined ? "" : String(v.privzeto)]));
}

export const defaultQuestions = (predloga: Predloga) => predloga.vprasanja.filter((q) => q.privzetoIzbrano).map((q) => q.id);

const norm = (s: string) => s.trim().toLocaleLowerCase("sl-SI");

/** Template medicines merged with what the patient already takes (previous rehabilitacija). */
export function mergeMedicines(
  predloga: Predloga,
  previous: { name: string; dose: string; times: TimeOfDay[]; purpose: string | null; active_substance: string | null }[],
): MedLine[] {
  const lines: MedLine[] = predloga.zdravila.map((z, i) => {
    const prev = previous.find((p) => norm(p.name) === norm(z.ime));
    return {
      key: `t${i}`,
      name: z.ime,
      activeSubstance: z.ucinkovina,
      purpose: z.zaKaj,
      doseOptions: z.odmerki,
      dose: prev?.dose ?? "",
      times: prev?.times ?? [...z.casi],
      selected: !!prev,
      previousDose: prev?.dose ?? null,
      asNeeded: z.poPotrebi,
      when: z.kdaj,
    };
  });
  previous.forEach((p, i) => {
    if (lines.some((l) => norm(l.name) === norm(p.name))) return;
    lines.push({
      key: `p${i}`,
      name: p.name,
      activeSubstance: p.active_substance,
      purpose: p.purpose,
      doseOptions: [],
      dose: p.dose,
      times: p.times,
      selected: true,
      previousDose: p.dose,
    });
  });
  return lines;
}

/** Novo / Spremenjeno / Nespremenjeno / Ukinjeno against the medicines before (T-35 shows this to the patient). */
export function medicineChange(line: Pick<MedLine, "selected" | "dose" | "previousDose">): MedicationChange | null {
  if (line.previousDose === null) return line.selected ? "novo" : null;
  if (!line.selected) return "ukinjeno";
  return norm(line.dose) === norm(line.previousDose) ? "nespremenjeno" : "spremenjeno";
}

export type NurseOption = { id: string; name: string; tereni: Pick<Teren, "obcina" | "naselja">[] };

/**
 * Patronažna sestra whose teren covers the address (občina, and naselje when the
 * teren lists naselja). If she is on nadomeščanje until today or later, her substitute.
 */
export function suggestNurse(
  obcina: string,
  naselje: string,
  nurses: NurseOption[],
  subs: Pick<Nadomescanje, "nurse_id" | "substitute_id" | "until_date">[],
  today: IsoDate,
): { nurse: NurseOption; obcina: string; via?: NurseOption } | undefined {
  const o = norm(obcina);
  const n = norm(naselje);
  if (!o) return undefined;
  const covers = (t: NurseOption["tereni"][number]) =>
    norm(t.obcina) === o && (!t.naselja?.length || (n !== "" && t.naselja.some((x) => norm(x) === n)));
  // Prefer a teren that names the naselje over a whole-občina teren.
  const specific = nurses.find((x) => x.tereni.some((t) => covers(t) && t.naselja?.length));
  const match = specific ?? nurses.find((x) => x.tereni.some(covers));
  if (!match) return undefined;
  const sub = subs.find((s) => s.nurse_id === match.id && s.until_date >= today);
  const substitute = sub && nurses.find((x) => x.id === sub.substitute_id);
  return substitute ? { nurse: substitute, obcina, via: match } : { nurse: match, obcina };
}

/** Daily questions chosen must stay within the daily limit. */
export function dailyCount(predloga: Predloga, ids: string[]) {
  return predloga.vprasanja.filter((q) => ids.includes(q.id) && q.pogostost === "dnevno").length;
}
