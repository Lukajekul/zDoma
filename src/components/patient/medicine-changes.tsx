import type { ReactNode } from "react";
import { groupChanges } from "@/app/patient/_lib/changes";
import { TIME_LABEL } from "@/app/patient/_lib/schedule";
import type { Medication } from "@/lib/types";
import { MedicineBox } from "./medicine-box";

const times = (m: Medication) => m.times.map((t) => TIME_LABEL[t].toLowerCase()).join(", ") || "po potrebi";

/** Novo / Spremenjeno / Ukinjeno (stopped first, in red with words), box picture and plain "what it's for". */
export function MedicineChanges({ meds }: { meds: Medication[] }) {
  const g = groupChanges(meds);
  return (
    <>
      {g.ukinjeno.length > 0 && (
        <Group title="Ukinjeno – tega ne jemljite več" stop>
          {g.ukinjeno.map((m) => <MedCard key={m.id} m={m} line={`Prej: ${m.dose}`} />)}
        </Group>
      )}
      {g.novo.length > 0 && (
        <Group title="Novo">
          {g.novo.map((m) => <MedCard key={m.id} m={m} line={`${m.dose} · ${times(m)}`} />)}
        </Group>
      )}
      {g.spremenjeno.length > 0 && (
        <Group title="Spremenjeno">
          {g.spremenjeno.map((m) => <MedCard key={m.id} m={m} line={`Prej ${m.previous_dose ?? "?"} → zdaj ${m.dose} · ${times(m)}`} />)}
        </Group>
      )}
      {!g.any && <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">Zdravila so ostala enaka kot pred bolnišnico.</p>}
      {g.enako.length > 0 && <p className="text-lg">Kot prej jemljete: {g.enako.map((m) => `${m.name} ${m.dose}`).join(", ")}.</p>}
    </>
  );
}

function Group({ title, stop, children }: { title: string; stop?: boolean; children: ReactNode }) {
  return (
    <section className={stop ? "flex flex-col gap-3 rounded-3xl border-2 border-status-rdece bg-status-rdece-bg p-4" : "flex flex-col gap-3"}>
      <h2 className={stop ? "text-2xl font-bold text-status-rdece" : "text-2xl font-bold"}>{title}</h2>
      <ul className="flex flex-col gap-3">{children}</ul>
    </section>
  );
}

function MedCard({ m, line }: { m: Medication; line: string }) {
  return (
    <li className="flex gap-4 rounded-3xl bg-card shadow-soft p-3">
      <MedicineBox name={m.name} photoUrl={m.photo_url} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xl font-bold">{m.name}</p>
        <p className="text-lg">{line}</p>
        {m.purpose && <p className="text-lg text-muted-foreground">Za: {m.purpose}</p>}
      </div>
    </li>
  );
}
