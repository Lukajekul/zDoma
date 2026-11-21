import { Pill } from "lucide-react";
import { oceniPrevzem, prevzemBesediloPacient, prevzemDosegel, type PrevzemZdravilo } from "@/lib/triage";
import type { IsoDate } from "@/lib/types";

/**
 * T-31: "Zdravila Furosemid še niste prevzeli v lekarni." for the patient, from
 * day N after discharge. Pure: pass the rehab's medicines, start date and today.
 * Renders nothing when everything is picked up.
 */
export function PickupReminder({ meds, odpust, danes }: { meds: PrevzemZdravilo[]; odpust: IsoDate; danes: IsoDate }) {
  const imena = oceniPrevzem(meds, odpust, danes)
    .filter((o) => prevzemDosegel(o, "pacient"))
    .map((o) => o.ime);
  if (imena.length === 0) return null;

  return (
    <div role="status" className="flex gap-3 rounded-3xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-status-rumeno">
      <Pill aria-hidden className="mt-1 size-7 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-xl font-bold">{prevzemBesediloPacient(imena)}</p>
        <p className="text-lg">Recept vas čaka v lekarni. Prosite lahko tudi svojca, da ga prevzame.</p>
      </div>
    </div>
  );
}
