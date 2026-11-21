import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ClipboardCheck, Dumbbell, Pill } from "lucide-react";
import { getMedsAndLogs } from "@/app/patient/_lib/doses";
import { getExercisesForDay } from "@/app/patient/_lib/exercises";
import { getMarkerNames } from "@/app/patient/_lib/marker-names";
import { addDays, dosesOn, TIME_LABEL, unloggedDoses } from "@/app/patient/_lib/schedule";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { createClient } from "@/lib/supabase/server";
import type { Checkin } from "@/lib/types";
import { getCarerRehab, patientName } from "../_lib/access";

export const metadata = { title: "Skrbim za – zDoma" };

/** T-20: how one patient is following the plan today, and what the zadolženec can mark. */
export default function CarerRehabPage({ params }: PageProps<"/carer/[rehabId]">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Skrbim za" back="/carer">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Overview params={params} />
    </Suspense>
  );
}

async function Overview({ params }: Pick<PageProps<"/carer/[rehabId]">, "params">) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const { rehab, patient, today, active } = c;
  const base = `/carer/${rehab.id}`;

  const supabase = await createClient();
  const [{ data: checkinRows }, { meds, logs }, exercises] = await Promise.all([
    supabase
      .from("checkins")
      .select("*")
      .eq("rehab_id", rehab.id)
      .gte("checkin_date", addDays(today, -6))
      .order("checkin_date", { ascending: false }),
    getMedsAndLogs(rehab.id),
    getExercisesForDay(rehab, today),
  ]);
  const checkins = (checkinRows ?? []) as Checkin[];
  const todayCheckin = checkins.find((x) => x.checkin_date === today);
  const names = await getMarkerNames(patient.id, [...logs, ...(todayCheckin ? [todayCheckin] : [])]);

  const doses = dosesOn(meds, logs, today).flatMap((g) => g.doses);
  const taken = doses.filter((d) => d.log?.status === "vzeto").length;
  const yesterday = addDays(today, -1);
  // Read-only: gaps are never written from here (entered_by would be the zadolženec).
  const yesterdayMissed = [
    ...logs.filter((l) => l.scheduled_date === yesterday && l.status === "izpusceno"),
    ...(yesterday >= rehab.start_date ? unloggedDoses(meds, logs, yesterday, yesterday) : []),
  ]
    .map((l) => {
      const m = meds.find((x) => x.id === l.medication_id);
      return m ? `${m.name} (${TIME_LABEL[l.time_of_day].toLowerCase()})` : null;
    })
    .filter((x): x is string => !!x);
  const exDone = exercises.filter((e) => e.logs.filter((l) => l.done).length >= e.exercise.times_per_day).length;
  const exSkipped = exercises.filter((e) => e.logs.some((l) => !l.done)).length;
  const { day, total } = rehabDay(rehab, today);
  const by = (enteredBy: string) => (enteredBy !== patient.id ? names[enteredBy] : undefined);

  return (
    <AppShell title={patientName(patient)} back="/carer">
      <p className="text-xl">
        {rehabTitle(rehab)} · {active ? `Dan ${day} od ${total}` : "Zaključeno"}
      </p>

      {/* T-31: medicines not picked up at the pharmacy go here, first, as a warning. */}

      <StatusBadge status={rehab.current_status} />

      <Card icon={<ClipboardCheck />} title="Današnji pregled">
        {todayCheckin ? (
          <p className="text-xl">
            Opravljen ✓{by(todayCheckin.entered_by) && ` · Označeno: ${by(todayCheckin.entered_by)}`}
          </p>
        ) : (
          <p className="text-xl font-semibold text-status-rumeno">Danes še ni opravljen.</p>
        )}
        <p className="text-lg text-muted-foreground">Zadnjih 7 dni: opravljen {checkins.length}-krat</p>
        {active && !todayCheckin && <BigButton href={`${base}/pregled`}>Odgovorita skupaj</BigButton>}
      </Card>

      <Card icon={<Pill />} title="Zdravila danes">
        {doses.length === 0 ? (
          <p className="text-xl">Danes ni predpisanih tablet.</p>
        ) : (
          <p className="text-xl">
            Vzeto {taken} od {doses.length}
            {taken === doses.length && " ✓"}
          </p>
        )}
        {yesterdayMissed.length > 0 && (
          <p className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-3 text-lg text-status-rumeno">
            Včeraj ni bilo označeno: {yesterdayMissed.join(", ")}.
          </p>
        )}
        {active && doses.length > 0 && (
          <BigButton href={`${base}/zdravila`} variant="secondary">
            Označi tablete
          </BigButton>
        )}
      </Card>

      <Card icon={<Dumbbell />} title="Vaje danes">
        {exercises.length === 0 ? (
          <p className="text-xl">V načrtu ni vaj.</p>
        ) : (
          <p className="text-xl">
            Opravljeno {exDone} od {exercises.length}
            {exSkipped > 0 && ` · izpuščeno ${exSkipped}`}
          </p>
        )}
        {active && exercises.length > 0 && (
          <BigButton href={`${base}/vaje`} variant="secondary">
            Označi vaje
          </BigButton>
        )}
      </Card>

      <p className="text-lg text-muted-foreground">
        Kar označite, se shrani z vašim imenom. Načrta, zdravil in datuma konca ne morete spreminjati.
      </p>
    </AppShell>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border-2 border-border p-4">
      <h2 className="flex items-center gap-2 text-2xl font-bold [&_svg]:size-7">
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
