import { Suspense } from "react";
import { notFound } from "next/navigation";
import { loadCheckinContext } from "@/app/patient/_lib/checkins";
import { CheckinFlow } from "@/components/patient/checkin/checkin-flow";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { StudentWarning } from "@/components/student/student-warning";
import { getNurseContact } from "@/app/student/_lib/contact";
import { type RehabParams, getCarerRehab, patientName } from "../../_lib/access";
import { carerSaveCheckin } from "../actions";
import { TogetherNote } from "../together-note";

export const metadata = { title: "Dnevni pregled – Skrbim za – zDoma" };

/** Zadolženec answers today's check-in together with the patient (same flow and triage as T-05). */
export default function CarerCheckinPage({ params }: RehabParams) {
  return (
    <Suspense
      fallback={
        <AppShell title="Dnevni pregled">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Checkin params={params} />
    </Suspense>
  );
}

async function Checkin({ params }: RehabParams) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c) notFound();
  const ctx = await loadCheckinContext(c.patient.id, c.rehab.id);
  if (!ctx) notFound();
  const back = c.base;
  const shell = (children: React.ReactNode) => (
    <AppShell title="Dnevni pregled" back={back}>
      {children}
    </AppShell>
  );

  if (ctx.todayCheckin) {
    const t = ctx.todayCheckin;
    const warnStudent = c.helper === "student" && t.triage_status !== "zeleno";
    const nurse = warnStudent ? await getNurseContact(c.rehab, c.profile.id) : null;
    return shell(
      <>
        <p role="status" className="rounded-3xl border-2 border-status-zeleno bg-status-zeleno-bg p-5 text-2xl font-bold text-status-zeleno">
          Shranjeno ✓
        </p>
        <StatusBadge status={t.triage_status} />
        {warnStudent && <StudentWarning status={t.triage_status} reasons={t.reasons ?? []} nurse={nurse} />}
        <BigButton href={back}>Nazaj</BigButton>
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
