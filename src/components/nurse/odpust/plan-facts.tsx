"use client";

import { useState } from "react";
import type { DejstvaPacienta } from "@/lib/moduli";
import { DIAGNOZE, jeAntibiotik, normKoda, POSEGI, veljavenAtc, veljavnaMkb10 } from "@/app/nurse/odpust/_lib/dejstva";
import { Chip, Field } from "./ui";

type Props = { value: DejstvaPacienta; brezAtc: string[]; onChange: (d: DejstvaPacienta) => void };

const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

/** Facts for the modular plan: pre-filled, staff confirm with taps; codes can be typed when needed. */
export function PlanFacts({ value, brezAtc, onChange }: Props) {
  const [koda, setKoda] = useState("");
  const [atc, setAtc] = useState("");
  const [napaka, setNapaka] = useState<string>();
  const set = (patch: Partial<DejstvaPacienta>) => onChange({ ...value, ...patch });
  const drugeKode = value.mkb10.filter((k) => !DIAGNOZE.some((d) => d.koda === k));

  function dodajKodo() {
    const k = normKoda(koda);
    if (!veljavnaMkb10(k)) return setNapaka("Vpišite kodo MKB-10, npr. I50 ali J18.9.");
    setNapaka(undefined);
    if (!value.mkb10.includes(k)) set({ mkb10: [...value.mkb10, k] });
    setKoda("");
  }

  function dodajAtc() {
    const k = normKoda(atc);
    if (!veljavenAtc(k)) return setNapaka("Vpišite kodo ATC, npr. C03CA01.");
    setNapaka(undefined);
    if (!value.zdravila.some((z) => z.atc === k)) set({ zdravila: [...value.zdravila, { atc: k }] });
    setAtc("");
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Diagnoze (MKB-10)</h3>
        <div className="flex flex-wrap gap-2">
          {DIAGNOZE.map((d) => (
            <Chip key={d.koda} on={value.mkb10.includes(d.koda)} onClick={() => set({ mkb10: toggle(value.mkb10, d.koda) })}>
              {d.ime} ({d.koda})
            </Chip>
          ))}
          {drugeKode.map((k) => (
            <Chip key={k} on onClick={() => set({ mkb10: value.mkb10.filter((x) => x !== k) })}>{k}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="grow"><Field label="Druga koda MKB-10" value={koda} onChange={setKoda} /></div>
          <button type="button" onClick={dodajKodo} className="min-h-12 rounded-xl bg-card px-4 text-lg font-semibold shadow-soft hover:bg-muted">Dodaj kodo</button>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Posegi</h3>
        <div className="flex flex-wrap gap-2">
          {POSEGI.map((p) => (
            <Chip key={p.kljuc} on={value.posegi.includes(p.kljuc)} onClick={() => set({ posegi: toggle(value.posegi, p.kljuc) })}>{p.ime}</Chip>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xl font-bold">Zdravila (ATC)</h3>
        <p className="text-base text-muted-foreground">Iz koraka »Zdravila«. Tapnite, da zdravilo odstranite iz načrta.</p>
        {value.zdravila.length === 0 && <p className="text-lg">Ni zdravil s kodo ATC.</p>}
        {value.zdravila.map((z) => (
          <div key={z.atc} className="flex flex-col gap-2 rounded-xl bg-card p-3 shadow-soft">
            <Chip on onClick={() => set({ zdravila: value.zdravila.filter((x) => x.atc !== z.atc) })}>
              {z.ime ? `${z.ime} (${z.atc})` : z.atc}
            </Chip>
            {jeAntibiotik(z.atc) && (
              <Field
                label="Zadnji dan jemanja"
                type="date"
                value={z.konec ?? ""}
                onChange={(konec) => set({ zdravila: value.zdravila.map((x) => (x.atc === z.atc ? { ...x, konec: konec || undefined } : x)) })}
                hint="Vprašanja o antibiotiku se ustavijo po tem dnevu. Prazno = ves čas."
              />
            )}
          </div>
        ))}
        {brezAtc.length > 0 && (
          <p className="text-base text-muted-foreground">Brez znane kode ATC (ne vplivajo na vprašanja): {brezAtc.join(", ")}.</p>
        )}
        <div className="flex flex-wrap items-end gap-2">
          <div className="grow"><Field label="Druga koda ATC" value={atc} onChange={setAtc} /></div>
          <button type="button" onClick={dodajAtc} className="min-h-12 rounded-xl bg-card px-4 text-lg font-semibold shadow-soft hover:bg-muted">Dodaj kodo</button>
        </div>
      </section>
      {napaka && <p role="alert" className="text-lg font-semibold text-status-rdece">{napaka}</p>}
    </div>
  );
}
