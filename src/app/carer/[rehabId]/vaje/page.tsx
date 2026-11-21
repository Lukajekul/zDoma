import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExercisesForDay } from "@/app/patient/_lib/exercises";
import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { ExerciseCard } from "@/components/patient/exercise-card";
import { AppShell } from "@/components/shell";
import { getCarerRehab, patientName } from "../../_lib/access";
import { carerLogExercise, carerUndoExercise } from "../actions";
import { TogetherNote } from "../together-note";

export const metadata = { title: "Vaje – Skrbim za – zDoma" };

/** Zadolženec marks exercises done (with pain 0–10) or skipped, together with the patient. */
export default function CarerExercisesPage({ params }: PageProps<"/carer/[rehabId]/vaje">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Vaje danes" back="/carer">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Exercises params={params} />
    </Suspense>
  );
}

async function Exercises({ params }: Pick<PageProps<"/carer/[rehabId]/vaje">, "params">) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const back = `/carer/${c.rehab.id}`;
  if (!c.active) {
    return (
      <AppShell title="Vaje danes" back={back}>
        <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">To okrevanje je zaključeno. Vaj ne označujete več.</p>
      </AppShell>
    );
  }

  const items = await getExercisesForDay(c.rehab, c.today);
  const names = await getMarkerNames(c.patient.id, items.flatMap((i) => i.logs));
  const who = (enteredBy: string) =>
    enteredBy === c.patient.id ? c.patient.first_name : enteredBy === c.profile.id ? undefined : names[enteredBy];

  return (
    <AppShell title="Vaje danes" back={back}>
      <TogetherNote name={patientName(c.patient)} />
      {items.length === 0 && <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">V načrtu ni vaj.</p>}
      <ul className="grid items-start gap-4 lg:grid-cols-2">
        {items.map(({ exercise: ex, content, logs }) => (
          <ExerciseCard
            key={ex.id}
            title={content?.naslov ?? ex.title}
            repetitions={ex.repetitions ?? content?.ponovitve ?? null}
            timesPerDay={ex.times_per_day}
            steps={content?.koraki ?? []}
            image={content?.slika}
            logs={logs.map((l) => ({
              id: l.id,
              done: l.done,
              pain: l.pain,
              canUndo: l.entered_by === c.profile.id,
              markedBy: who(l.entered_by),
            }))}
            onLog={carerLogExercise.bind(null, c.rehab.id, ex.id)}
            onUndo={carerUndoExercise.bind(null, c.rehab.id)}
          />
        ))}
      </ul>
      <p className="rounded-3xl bg-card border-2 border-status-rdece p-4 text-lg">
        Če med vajo začuti bolečino v prsih, nenadno hudo zadihanost ali omedli, naj preneha. Pokličite{" "}
        <a href="tel:112" className="font-bold text-status-rdece underline">
          112
        </a>
        .
      </p>
    </AppShell>
  );
}
