import { CalendarClock } from "lucide-react";
import { kdajZmanjka, zalogaBesedilo, zalogaKmaluPorabljena, type ZalogaZdravilo } from "@/lib/erecept/zaloga";
import type { IsoDate } from "@/lib/types";

/**
 * T-32: "Zdravila vam bodo zmanjkala čez 5 dni. Pokličite osebnega zdravnika za
 * nov recept." Lists which medicines and when. Never suggests a dose.
 * Renders nothing when no medicine runs out soon.
 */
export function SupplyReminder({ meds, danes }: { meds: ZalogaZdravilo[]; danes: IsoDate }) {
  const kmalu = zalogaKmaluPorabljena(meds, danes);
  if (kmalu.length === 0) return null;

  return (
    <div role="status" className="flex gap-3 rounded-3xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-status-rumeno">
      <CalendarClock aria-hidden className="mt-1 size-7 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="text-xl font-bold">{zalogaBesedilo(kmalu)}</p>
        <ul className="text-lg">
          {kmalu.map((o) => (
            <li key={o.ime}>
              {o.ime}: {o.dni < 0 ? "že porabljeno" : `zmanjka ${kdajZmanjka(o.dni)}`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
