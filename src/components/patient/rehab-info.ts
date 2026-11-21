import { getPredloga } from "@/lib/templates";
import type { IsoDate, Rehabilitacija } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (from: IsoDate, to: IsoDate) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);

/** "Dan 6 od 30": day of the rehabilitacija (1-based, clamped) and its length. */
export function rehabDay(rehab: Pick<Rehabilitacija, "start_date" | "end_date">, today: IsoDate) {
  const total = daysBetween(rehab.start_date, rehab.end_date) + 1;
  const day = Math.min(Math.max(daysBetween(rehab.start_date, today) + 1, 1), total);
  return { day, total };
}

/** Plain-language title: the diagnosis if set, else the template name. */
export function rehabTitle(rehab: Pick<Rehabilitacija, "diagnosis" | "template_id">) {
  return rehab.diagnosis || getPredloga(rehab.template_id)?.ime || "Okrevanje";
}
