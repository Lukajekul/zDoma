"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import type { Zdravilo } from "@/lib/templates";
import type { MedLine } from "@/app/nurse/odpust/_lib/plan";
import { isciZdravila, REGISTER_VIR } from "@/lib/zdravila";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string; detail: string; line: () => MedLine };
type Props = { catalogue: Zdravilo[]; taken: string[]; onAdd: (line: MedLine) => void };

/**
 * "Dodaj zdravilo" (T-74, T-82): search the template medicines and the EMA list.
 * Doctors use it on a PC, so ↑/↓ move, Enter adds the highlighted result, Esc clears.
 */
export function MedicineSearch({ catalogue, taken, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const found = isciZdravila(search, catalogue, taken);

  const groups: { title: string | null; options: Option[] }[] = [
    {
      title: "Iz predlog (z običajnimi odmerki)",
      options: found.priporocena.map((z) => ({ id: `p-${z.ime}`, name: z.ime, detail: z.ucinkovina, line: () => fromTemplate(z, z.ime) })),
    },
    {
      title: "Drugo ime za priporočeno zdravilo",
      options: found.isteUcinkovine.map(({ ime, zdravilo }) => ({
        id: `i-${ime}`,
        name: ime,
        detail: `${zdravilo.ucinkovina} · kot ${zdravilo.ime}`,
        line: () => fromTemplate(zdravilo, ime),
      })),
    },
    {
      title: "Druga zdravila",
      options: found.ostala.map((m) => ({ id: `o-${m.ime}|${m.ucinkovina}`, name: m.ime, detail: m.ucinkovina, line: () => manual(m.ime, m.ucinkovina) })),
    },
    {
      title: null,
      options: found.novo
        ? [{ id: "novo", name: `Dodaj »${found.novo}« kot novo zdravilo`, detail: "Odmerek in čas vpišete sami.", line: () => manual(found.novo!, null) }]
        : [],
    },
  ];
  const options = groups.flatMap((g) => g.options);
  const indexOf = new Map(options.map((o, i) => [o.id, i]));
  const current = Math.min(active, options.length - 1);
  const domId = (i: number) => `zdravilo-moznost-${i}`;

  const change = (v: string) => {
    setSearch(v);
    setActive(0);
  };
  const pick = (o: Option) => {
    onAdd(o.line());
    change("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") return change("");
    if (!options.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (current + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActive(next);
      document.getElementById(domId(next))?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(options[current]);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-border p-4">
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Dodaj zdravilo
        <input
          type="text"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls="zdravilo-moznosti"
          aria-activedescendant={options.length ? domId(current) : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          value={search}
          onChange={(e) => change(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-12 rounded-2xl border-2 border-border bg-card px-3 text-xl font-normal"
        />
        <span className="text-base font-normal text-muted-foreground">
          Vpišite ime zdravila ali učinkovine. Na računalniku: puščici gor in dol, Enter doda zdravilo.
        </span>
      </label>
      <p className="text-base text-muted-foreground">{REGISTER_VIR}</p>
      <div id="zdravilo-moznosti" role="listbox" aria-label="Najdena zdravila" className="flex flex-col gap-3">
        {groups.map((g) =>
          g.options.length ? (
            <div key={g.title ?? "novo"} role="group" aria-label={g.title ?? undefined} className="flex flex-col gap-2">
              {g.title && <h3 className="text-lg font-bold">{g.title}</h3>}
              {g.options.map((o) => {
                const i = indexOf.get(o.id)!;
                return (
                  <button
                    key={o.id}
                    id={domId(i)}
                    type="button"
                    role="option"
                    aria-selected={i === current}
                    tabIndex={-1}
                    onClick={() => pick(o)}
                    onMouseEnter={() => setActive(i)}
                    className={cn(
                      "flex min-h-12 items-start gap-2 rounded-xl bg-card shadow-soft px-3 py-2 text-left text-lg hover:bg-muted",
                      i === current && "bg-muted ring-2 ring-primary",
                    )}
                  >
                    <Plus aria-hidden className="mt-1 size-5 shrink-0" />
                    <span className="flex flex-col">
                      <span className="font-semibold">{o.name}</span>
                      <span className="text-base text-muted-foreground">{o.detail}</span>
                    </span>
                    {i === current && <span className="ml-auto hidden shrink-0 self-center text-base text-muted-foreground sm:inline">Enter ↵</span>}
                  </button>
                );
              })}
            </div>
          ) : null,
        )}
      </div>
    </section>
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

/** A medicine without template doses: the doctor types the dose and picks the times. */
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
