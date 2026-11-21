import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/patient/exercise-card";
import { AppShell } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { isRehabActive, todayLjubljana } from "@/lib/types";
import { getExercisesForDay } from "../../_lib/exercises";
import { getMarkerNames } from "../../_lib/marker-names";
import { getMyRehab } from "../../_lib/rehabs";
import { logExercise, undoExercise } from "./actions";

export const metadata = { title: "Vaje – zDoma" };

/** T-07: today's exercises with picture and steps, "Opravljeno?" + pain 0–10. */
export default function ExercisesPage({ params }: PageProps<"/patient/[rehabId]/vaje">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Vaje danes" back="/patient">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Exercises params={params} />
    </Suspense>
  );
}

async function Exercises({ params }: Pick<PageProps<"/patient/[rehabId]/vaje">, "params">) {
  const { rehabId } = await params;
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) notFound();

  const today = todayLjubljana();
  const active = isRehabActive(rehab, today);
  const items = await getExercisesForDay(rehab, today);
  const names = await getMarkerNames(profile.id, items.flatMap((i) => i.logs));
  const doneCount = items.filter((i) => i.logs.length >= i.exercise.times_per_day).length;

  return (
    <AppShell title={active ? "Vaje danes" : "Vaje"} back={`/patient/${rehab.id}`}>
      {!active && (
        <p className="rounded-xl bg-muted p-4 text-xl">
          To okrevanje je zaključeno. Tukaj so vaje, ki ste jih takrat delali.
        </p>
      )}

      {items.length === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-xl">V vašem načrtu ni vaj.</p>
      ) : (
        active && (
          <p className="text-xl font-semibold">
            Opravljeno {doneCount} od {items.length}
            {doneCount === items.length && " ✓ Za danes ste končali."}
          </p>
        )
      )}

      <ul className="flex flex-col gap-4">
        {items.map(({ exercise: ex, content, logs }) => (
          <ExerciseCard
            key={ex.id}
            title={content?.naslov ?? ex.title}
            repetitions={ex.repetitions ?? content?.ponovitve ?? null}
            timesPerDay={ex.times_per_day}
            steps={content?.koraki ?? []}
            image={content?.slika}
            readOnly={!active}
            logs={(active ? logs : []).map((l) => ({
              id: l.id,
              done: l.done,
              pain: l.pain,
              canUndo: l.entered_by === profile.id,
              markedBy: l.entered_by === profile.id ? undefined : names[l.entered_by],
            }))}
            onLog={logExercise.bind(null, rehab.id, ex.id)}
            onUndo={undoExercise.bind(null, rehab.id)}
          />
        ))}
      </ul>

      <p className="rounded-xl border-2 border-status-rdece p-4 text-lg">
        Če med vajo začutite bolečino v prsih, nenadno hudo zadihanost ali omedlevico, prenehajte in
        pokličite <a href="tel:112" className="font-bold text-status-rdece underline">112</a>.
      </p>
    </AppShell>
  );
}
