"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "lucide-react";
import { escapeHtml as esc, PinMap, shortName } from "@/components/map/pin-map";
import { TIME_LABEL } from "@/app/patient/_lib/schedule";
import type { RoutePin, Stop } from "@/app/student/_lib/route";
import { clock } from "@/lib/student/visits";
import { cn } from "@/lib/utils";

/**
 * T-99 "Danes po vrsti": every visit still waiting today, in time order, with
 * the address and "Pot" (directions), plus a map with numbered pins.
 * Map beside the list from 768 px, below it on a phone.
 */
export function RouteToday({ stops, pins }: { stops: Stop[]; pins: RoutePin[] }) {
  const [focus, setFocus] = useState<string | null>(null);
  const orderOf = (rehabId: string) => pins.find((p) => p.rehabId === rehabId)?.order;

  if (stops.length === 0) {
    return <p className="rounded-3xl bg-status-zeleno-bg p-4 text-xl font-bold text-status-zeleno">Danes nimate več obiskov ✓</p>;
  }

  return (
    <section aria-labelledby="po-vrsti" className="flex flex-col gap-3">
      <h2 id="po-vrsti" className="text-2xl font-bold">Danes po vrsti</h2>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ol className="flex flex-col gap-2">
          {stops.map((s) => {
            const n = orderOf(s.rehabId);
            return (
              <li key={s.key} className={cn("flex flex-col gap-2 rounded-3xl bg-card p-4 shadow-soft", focus === s.rehabId && "ring-4 ring-primary")}>
                <button type="button" onClick={() => setFocus(s.rehabId)} className="flex flex-col gap-1 text-left">
                  <span className="text-2xl font-bold">
                    {clock(s.at)} · {s.name}
                  </span>
                  <span className="text-lg">
                    {n && <span className="mr-2 inline-grid size-7 place-items-center rounded-full bg-primary text-base font-bold text-primary-foreground" aria-label={`Na zemljevidu ${n}`}>{n}</span>}
                    {TIME_LABEL[s.slot]}
                    {s.late && <strong className="ml-2 text-status-rumeno">– zamuja</strong>}
                  </span>
                  <span className="text-lg text-muted-foreground">{s.address ?? "Naslov ni vpisan. Pokličite sestro."}</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {s.directions ? (
                    <a href={s.directions} target="_blank" rel="noopener noreferrer"
                      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-primary text-lg font-bold text-primary hover:bg-muted">
                      <Navigation aria-hidden className="size-5" /> Pot
                    </a>
                  ) : <span />}
                  <Link href={`/student/${s.rehabId}`}
                    className="flex min-h-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground hover:bg-primary/90">
                    Začni obisk
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
        {pins.length > 0 && (
          <div className="md:sticky md:top-4 md:h-[calc(100dvh-10rem)]">
            <PinMap
              label="Zemljevid današnjih obiskov"
              focus={focus}
              onSelect={setFocus}
              pins={pins.map((p) => ({
                id: p.rehabId,
                place: p.place,
                html: `<span class="zp zp-visit${focus === p.rehabId ? " zp-selected" : ""}"><span class="zp-num"><span>${p.order}</span></span> ${clock(p.at)} ${esc(shortName(p.name))}</span>`,
                title: `${p.order}. ${p.name} ob ${clock(p.at)}`,
                z: focus === p.rehabId ? 1000 : -p.order,
                clickable: true,
              }))}
              legend={<span>Številka = vrstni red obiskov danes. Lega je približna (središče občine), za pot uporabite gumb »Pot«.</span>}
            />
          </div>
        )}
      </div>
    </section>
  );
}
