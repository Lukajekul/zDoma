import { Pill } from "lucide-react";
import { oceniPrevzem, prevzemBesediloZadolzenec, prevzemDosegel, type PrevzemZdravilo } from "@/lib/triage";
import type { IsoDate } from "@/lib/types";

const dniPoOdpustu = (dni: number) => (dni === 1 ? "1 dan po odpustu" : `${dni} dni po odpustu`);

/**
 * T-48: warning for the zadolženec when new or changed medicines are still not
 * picked up at the pharmacy. Shown from the same day as the patient's reminder
 * (T-92), on the overview and on "Zdravila". Names the medicines in the app only;
 * no dose advice. Renders nothing otherwise.
 */
export function PickupWarning({
  meds,
  odpust,
  danes,
  ime,
}: {
  meds: PrevzemZdravilo[];
  odpust: IsoDate;
  danes: IsoDate;
  /** Patient's first name. */
  ime: string;
}) {
  const manjka = oceniPrevzem(meds, odpust, danes).filter((o) => prevzemDosegel(o, "pacient"));
  if (manjka.length === 0) return null;

  return (
    <div role="alert" className="flex gap-3 rounded-3xl border-2 border-status-rdece bg-status-rdece-bg p-4 text-status-rdece">
      <Pill aria-hidden className="mt-1 size-7 shrink-0" />
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold">{prevzemBesediloZadolzenec(ime)}</p>
        <ul className="text-lg">
          {manjka.map((o) => (
            <li key={o.zdraviloId}>
              {o.ime} – ni prevzeto {dniPoOdpustu(o.dni)}
            </li>
          ))}
        </ul>
        <p className="text-lg">Pomagajte pri prevzemu v lekarni. Če kaj ni jasno, pokličite patronažno sestro.</p>
      </div>
    </div>
  );
}
