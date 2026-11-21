import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMedsAndLogs } from "@/app/patient/_lib/doses";
import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { dosesOn, TIME_LABEL } from "@/app/patient/_lib/schedule";
import { DoseCard } from "@/components/patient/dose-card";
import { AppShell } from "@/components/shell";
import { getCarerRehab, patientName } from "../../_lib/access";
import { carerMarkTaken, carerUndoTaken } from "../actions";
import { TogetherNote } from "../together-note";

export const metadata = { title: "Zdravila – Skrbim za – zDoma" };

/** Zadolženec marks today's pills "Vzeto" when taken together with the patient. */
export default function CarerPillsPage({ params }: PageProps<"/carer/[rehabId]/zdravila">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Zdravila danes" back="/carer">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Pills params={params} />
    </Suspense>
  );
}

async function Pills({ params }: Pick<PageProps<"/carer/[rehabId]/zdravila">, "params">) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const back = `/carer/${c.rehab.id}`;
  if (!c.active) {
    return (
      <AppShell title="Zdravila danes" back={back}>
        <p className="rounded-xl bg-muted p-4 text-xl">To okrevanje je zaključeno. Tablet ne označujete več.</p>
      </AppShell>
    );
  }

  const { meds, logs } = await getMedsAndLogs(c.rehab.id);
  const groups = dosesOn(meds, logs, c.today);
  const names = await getMarkerNames(c.patient.id, logs);
  const who = (enteredBy: string) =>
    enteredBy === c.patient.id ? c.patient.first_name : enteredBy === c.profile.id ? undefined : names[enteredBy];

  return (
    <AppShell title="Zdravila danes" back={back}>
      <TogetherNote name={patientName(c.patient)} />
      {groups.length === 0 && <p className="rounded-xl bg-muted p-4 text-xl">Danes ni predpisanih tablet.</p>}
      {groups.map(({ time, doses }) => (
        <section key={time} className="flex flex-col gap-3">
          <h2 className="mt-2 text-2xl font-bold">{TIME_LABEL[time]}</h2>
          <ul className="flex flex-col gap-3">
            {doses.map(({ medication: m, log }) => (
              <DoseCard
                key={m.id}
                name={m.name}
                dose={m.dose}
                purpose={m.purpose}
                taken={log?.status === "vzeto"}
                markedBy={log ? who(log.entered_by) : undefined}
                canUndo={!!log && log.entered_by === c.profile.id}
                onTake={carerMarkTaken.bind(null, c.rehab.id, m.id, time)}
                onUndo={carerUndoTaken.bind(null, c.rehab.id, log?.id ?? "")}
              />
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
}
