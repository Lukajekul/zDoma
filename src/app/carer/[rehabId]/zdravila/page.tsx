import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMedsAndLogs } from "@/app/patient/_lib/doses";
import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { dosesOn, TIME_LABEL } from "@/app/patient/_lib/schedule";
import { PickupWarning } from "@/components/carer/pickup-warning";
import { DoseCard } from "@/components/patient/dose-card";
import { AppShell } from "@/components/shell";
import { type RehabParams, getCarerRehab, patientName } from "../../_lib/access";
import { carerMarkTaken, carerUndoTaken } from "../actions";
import { TogetherNote } from "../together-note";

export const metadata = { title: "Zdravila – Skrbim za – zDoma" };

/** Zadolženec marks today's pills "Vzeto" when taken together with the patient. */
export default function CarerPillsPage({ params }: RehabParams) {
  return (
    <Suspense
      fallback={
        <AppShell title="Zdravila danes">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Pills params={params} />
    </Suspense>
  );
}

async function Pills({ params }: RehabParams) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const back = c.base;
  if (!c.active) {
    return (
      <AppShell title="Zdravila danes" back={back}>
        <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">To okrevanje je zaključeno. Tablet ne označujete več.</p>
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
      <PickupWarning meds={meds} odpust={c.rehab.start_date} danes={c.today} ime={c.patient.first_name} />
      <TogetherNote name={patientName(c.patient)} />
      {groups.length === 0 && <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">Danes ni predpisanih tablet.</p>}
      {groups.map(({ time, doses }) => (
        <section key={time} className="flex flex-col gap-3">
          <h2 className="mt-2 text-2xl font-bold">{TIME_LABEL[time]}</h2>
          <ul className="grid items-start gap-3 lg:grid-cols-2">
            {doses.map(({ medication: m, log }) => (
              <DoseCard
                key={m.id}
                name={m.name}
                dose={m.dose}
                purpose={m.purpose}
                taken={log?.status === "vzeto"}
                markedBy={log ? who(log.entered_by) : undefined}
                canUndo={log?.status === "vzeto"}
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
