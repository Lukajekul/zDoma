import { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadCheckinContext } from "@/app/patient/_lib/checkins";
import { CheckinFlow } from "@/components/patient/checkin/checkin-flow";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { getCarerRehab, patientName } from "../../_lib/access";
import { carerSaveCheckin } from "../actions";
import { TogetherNote } from "../together-note";

export const metadata = { title: "Pregled – Skrbim za – zDoma" };

/** Zadolženec answers today's check-in together with the patient (same flow and triage as T-05). */
export default function CarerCheckinPage({ params }: PageProps<"/carer/[rehabId]/pregled">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Današnji pregled" back="/carer">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Checkin params={params} />
    </Suspense>
  );
}

async function Checkin({ params }: Pick<PageProps<"/carer/[rehabId]/pregled">, "params">) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const ctx = await loadCheckinContext(c.patient.id, c.rehab.id);
  if (!ctx) notFound();
  const back = `/carer/${c.rehab.id}`;
  const shell = (children: React.ReactNode) => (
    <AppShell title="Današnji pregled" back={back}>
      {children}
    </AppShell>
  );

  if (ctx.todayCheckin) {
    return shell(
      <>
        <p role="status" className="rounded-3xl border-2 border-status-zeleno bg-status-zeleno-bg p-5 text-2xl font-bold text-status-zeleno">
          Shranjeno ✓
        </p>
        <StatusBadge status={ctx.todayCheckin.triage_status} />
        <BigButton href={back}>Nazaj na pregled</BigButton>
      </>,
    );
  }
  if (!ctx.active) return shell(<p className="rounded-3xl bg-card shadow-soft p-4 text-xl">To okrevanje je zaključeno.</p>);
  if (!ctx.questions.length) return shell(<p className="rounded-3xl bg-card shadow-soft p-4 text-xl">Za danes ni vprašanj.</p>);

  return shell(
    <>
      <TogetherNote name={patientName(c.patient)} />
      <CheckinFlow
        rehabId={ctx.rehab.id}
        today={ctx.today}
        questions={ctx.questions}
        canRepeat={!!ctx.sameSource}
        save={carerSaveCheckin.bind(null, ctx.rehab.id)}
      />
    </>,
  );
}
