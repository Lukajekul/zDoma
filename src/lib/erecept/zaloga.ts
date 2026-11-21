// T-32: days left until a medicine runs out. Pure, no I/O (not server-only).
//
// Days left = pack size from the pharmacy pick-up ÷ daily dose from the plan,
// counted from the pick-up date. The plan stores a strength ("40 mg"), not a
// pill count, so the daily dose is one unit per scheduled time of day.
// The result only ever sends the patient to their GP; it never suggests a dose.
import type { IsoDate, Medication } from "@/lib/types";

/** Show the reminder when this many days or fewer are left. A setting, not a medical rule. */
export const ZALOGA_OPOZORILO_DNI = 5;

export type ZalogaZdravilo = Pick<
  Medication,
  "name" | "times" | "change" | "end_date" | "picked_up_at" | "pickup_pack_size"
>;

const DAN_MS = 86_400_000;
const dan = (d: IsoDate) => {
  const [y, m, dd] = d.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, dd) / DAN_MS);
};

/**
 * Whole days of medicine left after today's doses (0 = runs out today,
 * negative = should already have run out). Null when it can't be worked out
 * or doesn't apply: not picked up, no pack size, taken as needed, stopped, or
 * the medicine ends before the pack would run out.
 */
export function dniZaloge(z: ZalogaZdravilo, danes: IsoDate): number | null {
  const naDan = z.times.length;
  if (z.change === "ukinjeno" || naDan === 0) return null;
  if (!z.picked_up_at || !z.pickup_pack_size || z.pickup_pack_size <= 0) return null;

  const zadostujeDni = Math.floor(z.pickup_pack_size / naDan);
  const zadnjiDan = dan(z.picked_up_at) + zadostujeDni - 1;
  if (z.end_date && dan(z.end_date) <= zadnjiDan) return null;
  return zadnjiDan - dan(danes);
}

export interface ZalogaOpozorilo {
  ime: string;
  dni: number;
}

/** Medicines that run out within `meja` days, soonest first. */
export function zalogaKmaluPorabljena(
  zdravila: ZalogaZdravilo[],
  danes: IsoDate,
  meja = ZALOGA_OPOZORILO_DNI,
): ZalogaOpozorilo[] {
  return zdravila
    .map((z) => ({ ime: z.name, dni: dniZaloge(z, danes) }))
    .filter((o): o is ZalogaOpozorilo => o.dni !== null && o.dni <= meja)
    .sort((a, b) => a.dni - b.dni);
}

/** "danes", "jutri", "čez 3 dni" */
export function kdajZmanjka(dni: number): string {
  if (dni <= 0) return "danes";
  if (dni === 1) return "jutri";
  return `čez ${dni} dni`;
}

/** Patient text: "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za nov recept." */
export function zalogaBesedilo(o: ZalogaOpozorilo[]): string {
  const najprej = o[0]?.dni ?? 0;
  const kdaj = najprej < 0 ? "so vam po izračunu že zmanjkala" : `vam bodo zmanjkala ${kdajZmanjka(najprej)}`;
  return `Zdravila ${kdaj}. Pokličite osebnega zdravnika za nov recept.`;
}
