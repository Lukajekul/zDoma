"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { Zdravilo } from "@/lib/templates";
import type { TimeOfDay } from "@/lib/types";
import { medicineChange, TIME_LABEL, type MedLine } from "@/app/nurse/odpust/_lib/plan";
import { isciZdravila, REGISTER_VIR } from "@/lib/zdravila";
import { Chip, Field } from "./ui";

const TIMES: TimeOfDay[] = ["zjutraj", "opoldne", "zvecer", "ponoci"];
const CHANGE_LABEL = { novo: "Novo", spremenjeno: "Spremenjeno", nespremenjeno: "Kot prej", ukinjeno: "Ukinjeno" } as const;

type Props = { lines: MedLine[]; catalogue: Zdravilo[]; note?: string; onChange: (l: MedLine[]) => void; onNext: () => void };

/** Step 4: tick a medicine, tap a usual dose and time. "Uredi" for custom, "Dodaj zdravilo" searches the EMA list (T-74). */
export function StepMedicines({ lines, catalogue, note, onChange, onNext }: Props) {
  const [editing, setEditing] = useState<string>();
  const [search, setSearch] = useState("");
  const set = (key: string, patch: Partial<MedLine>) => onChange(lines.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const incomplete = lines.some((l) => l.selected && (!l.dose.trim() || (!l.times.length && !l.asNeeded)));
  const found = isciZdravila(search, catalogue, lines.map((l) => l.name));
  const add = (line: MedLine) => {
    onChange([...lines, line]);
    setSearch("");
  };

  return (
    <div className="flex flex-col gap-4">
      {note && <p className="rounded-3xl bg-card shadow-soft p-4 text-lg">{note}</p>}
      <p className="text-lg text-muted-foreground">Predlogi za osebje. Pacient možnosti odmerkov ne vidi.</p>
      {lines.length === 0 && <p className="text-lg">Predloga nima priporočenih zdravil. Dodajte jih spodaj.</p>}
      {lines.map((l) => {
        const change = medicineChange(l);
        return (
          <section key={l.key} className="flex flex-col gap-3 rounded-3xl bg-card shadow-soft p-4">
            <label className="flex items-center gap-3 text-xl font-bold">
              <input type="checkbox" className="size-6" checked={l.selected} onChange={() => set(l.key, { selected: !l.selected })} />
              {l.name}
              {change && <span className="rounded-md bg-muted px-2 text-base font-semibold">{CHANGE_LABEL[change]}</span>}
            </label>
            {l.purpose && <p className="text-lg text-muted-foreground">Za: {l.purpose}</p>}
            {l.when && <p className="text-base text-muted-foreground">Kdaj: {l.when}</p>}
            {l.asNeeded && <p className="text-lg">Po potrebi (brez stalnega časa)</p>}
            {l.previousDose && <p className="text-lg">Prej: {l.previousDose}</p>}
            {l.selected && (
              <>
                {l.doseOptions.length > 0 && editing !== l.key && (
                  <div className="flex flex-wrap gap-2">
                    {l.doseOptions.map((d) => (
                      <Chip key={d} on={l.dose === d} onClick={() => set(l.key, { dose: d })}>{d}</Chip>
                    ))}
                  </div>
                )}
                {l.dose && !l.doseOptions.includes(l.dose) && editing !== l.key && l.doseOptions.length > 0 && (
                  <p className="text-lg font-semibold">Odmerek: {l.dose}</p>
                )}
                {(editing === l.key || l.doseOptions.length === 0) && (
                  <Field label="Odmerek" value={l.dose} onChange={(dose) => set(l.key, { dose })} hint="npr. 40 mg" />
                )}
                <div className="flex flex-wrap gap-2">
                  {TIMES.map((t) => (
                    <Chip key={t} on={l.times.includes(t)} onClick={() => set(l.key, { times: l.times.includes(t) ? l.times.filter((x) => x !== t) : [...l.times, t] })}>
                      {TIME_LABEL[t]}
                    </Chip>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setEditing(editing === l.key ? undefined : l.key)} className="min-h-12 rounded-xl bg-card shadow-soft px-4 text-lg font-semibold hover:bg-muted">
                    {editing === l.key ? "Končaj urejanje" : "Uredi"}
                  </button>
                  {l.added && (
                    <button type="button" onClick={() => onChange(lines.filter((x) => x.key !== l.key))} className="min-h-12 rounded-lg border-2 border-status-rdece px-4 text-lg font-semibold text-status-rdece">
                      Odstrani
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        );
      })}

      <section className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-border p-4">
        <Field label="Dodaj zdravilo" value={search} onChange={setSearch} hint="Vpišite ime zdravila ali učinkovine." />
        <p className="text-base text-muted-foreground">{REGISTER_VIR}</p>
        {found.priporocena.length > 0 && (
          <Group title="Iz predlog (z običajnimi odmerki)">
            {found.priporocena.map((z) => (
              <AddButton key={z.ime} onClick={() => add(fromTemplate(z, z.ime))} name={z.ime} detail={z.ucinkovina} />
            ))}
          </Group>
        )}
        {found.isteUcinkovine.length > 0 && (
          <Group title="Drugo ime za priporočeno zdravilo">
            {found.isteUcinkovine.map(({ ime, zdravilo }) => (
              <AddButton key={ime} onClick={() => add(fromTemplate(zdravilo, ime))} name={ime} detail={`${zdravilo.ucinkovina} · kot ${zdravilo.ime}`} />
            ))}
          </Group>
        )}
        {found.ostala.length > 0 && (
          <Group title="Druga zdravila">
            {found.ostala.map((m) => (
              <AddButton key={`${m.ime}|${m.ucinkovina}`} onClick={() => add(manual(m.ime, m.ucinkovina))} name={m.ime} detail={m.ucinkovina} />
            ))}
          </Group>
        )}
        {found.novo && (
          <AddButton onClick={() => add(manual(found.novo!, null))} name={`Dodaj »${found.novo}« kot novo zdravilo`} detail="Odmerek in čas vpišete sami." />
        )}
      </section>

      {incomplete && <p className="text-lg text-muted-foreground">Pri vsakem izbranem zdravilu izberite odmerek in čas.</p>}
      <BigButton onClick={onNext} disabled={incomplete}>Naprej</BigButton>
    </div>
  );
}

/** A line with the template medicine's usual doses, under the chosen brand name. */
const fromTemplate = (z: Zdravilo, name: string): MedLine => ({
  key: `a${Date.now()}`,
  name,
  activeSubstance: z.ucinkovina,
  purpose: z.zaKaj,
  doseOptions: z.odmerki,
  dose: "",
  times: [...z.casi],
  selected: true,
  previousDose: null,
  added: true,
  asNeeded: z.poPotrebi,
  when: z.kdaj,
});

/** A medicine without template doses: the bolničar types the dose and picks the times. */
const manual = (name: string, activeSubstance: string | null): MedLine => ({
  key: `a${Date.now()}`,
  name,
  activeSubstance,
  purpose: null,
  doseOptions: [],
  dose: "",
  times: [],
  selected: true,
  previousDose: null,
  added: true,
});

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

function AddButton({ name, detail, onClick }: { name: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-12 items-start gap-2 rounded-xl bg-card shadow-soft px-3 py-2 text-left text-lg hover:bg-muted">
      <Plus aria-hidden className="mt-1 size-5 shrink-0" />
      <span className="flex flex-col">
        <span className="font-semibold">{name}</span>
        <span className="text-base text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
}
