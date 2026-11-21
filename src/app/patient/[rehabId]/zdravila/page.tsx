import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DoseCard } from "@/components/patient/dose-card";
import { AppShell } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { formatLongDate } from "@/lib/format";
import { isRehabActive, todayLjubljana, type DoseLog, type Medication } from "@/lib/types";
import { getMedsAndLogs, logMissedDoses } from "../../_lib/doses";
import { getMyRehab } from "../../_lib/rehabs";
import { addDays, dosesOn, TIME_LABEL } from "../../_lib/schedule";
import { getMarkerNames } from "./marker-names";
import { markTaken, undoTaken } from "./actions";

export const metadata = { title: "Zdravila – zDoma" };

/** T-06: today's pills by time of day, big "Vzeto", missed doses logged. */
export default function PillsPage({ params }: PageProps<"/patient/[rehabId]/zdravila">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Zdravila danes" back="/patient">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Pills params={params} />
    </Suspense>
  );
}

async function Pills({ params }: Pick<PageProps<"/patient/[rehabId]/zdravila">, "params">) {
  const { rehabId } = await params;
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) notFound();

  const back = `/patient/${rehab.id}`;
  const today = todayLjubljana();
  const { meds, logs: loaded } = await getMedsAndLogs(rehab.id);

  if (!isRehabActive(rehab, today)) {
    return (
      <AppShell title="Zdravila" back={back}>
        <p className="rounded-xl bg-muted p-4 text-xl">
          To okrevanje je zaključeno. Tukaj so zdravila, ki ste jih takrat jemali.
        </p>
        <MedicationList meds={meds} />
      </AppShell>
    );
  }

  const logs = await logMissedDoses(rehab, meds, loaded, today);
  const groups = dosesOn(meds, logs, today);
  const all = groups.flatMap((g) => g.doses);
  const takenCount = all.filter((d) => d.log?.status === "vzeto").length;
  const names = await getMarkerNames(profile.id, logs);
  const yesterdayMissed = missedOn(meds, logs, addDays(today, -1));

  return (
    <AppShell title="Zdravila danes" back={back}>
      <p className="text-xl">{capitalize(formatLongDate(new Date()))}</p>

      {all.length === 0 ? (
        <p className="rounded-xl bg-muted p-4 text-xl">Danes nimate predpisanih tablet.</p>
      ) : (
        <p className="text-xl font-semibold">
          Vzeto {takenCount} od {all.length}
          {takenCount === all.length && " ✓ Vse tablete za danes so vzete."}
        </p>
      )}

      {yesterdayMissed.length > 0 && (
        <p className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
          Včeraj ni bilo označeno: {yesterdayMissed.join(", ")}. Če niste prepričani, kaj storiti, pokličite patronažno sestro.
        </p>
      )}

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
                markedBy={log && log.entered_by !== profile.id ? names[log.entered_by] : undefined}
                canUndo={!!log && log.entered_by === profile.id}
                onTake={markTaken.bind(null, rehab.id, m.id, time)}
                onUndo={undoTaken.bind(null, rehab.id, log?.id ?? "")}
              />
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
}

/** "Furosemid (zjutraj)" for each dose logged as izpuščeno on that date. */
function missedOn(meds: Medication[], logs: DoseLog[], date: string) {
  return logs
    .filter((l) => l.scheduled_date === date && l.status === "izpusceno")
    .map((l) => {
      const m = meds.find((x) => x.id === l.medication_id);
      return m ? `${m.name} (${TIME_LABEL[l.time_of_day].toLowerCase()})` : null;
    })
    .filter((x): x is string => !!x);
}

function MedicationList({ meds }: { meds: Medication[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {meds.map((m) => (
        <li key={m.id} className="rounded-xl border-2 border-border p-4">
          <p className="text-xl font-bold">
            {m.name} {m.dose}
          </p>
          <p className="text-lg">{m.times.map((t) => TIME_LABEL[t]).join(", ")}</p>
          {m.purpose && <p className="text-lg text-muted-foreground">Za: {m.purpose}</p>}
        </li>
      ))}
    </ul>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
