import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckinFlow } from "@/components/patient/checkin/checkin-flow";
import { EndScreen } from "@/components/patient/checkin/end-screen";
import { ProgressRing } from "@/components/patient/progress-ring";
import { rehabDay } from "@/components/patient/rehab-info";
import { AppShell } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import type { Checkin } from "@/lib/types";
import { pillsHref, slotDueNow } from "../../_lib/auto-start";
import { targetFor } from "../../_lib/checkin-plan";
import { SLOT_ADJ } from "../../_lib/danes";
import { getMedsAndLogs } from "../../_lib/doses";
import { loadCheckinContext } from "../../_lib/checkins";
import { getRing } from "../../_lib/ring";
import { addDays } from "../../_lib/schedule";
import { saveCheckin } from "./actions";

export const metadata = { title: "Dnevni pregled – zDoma" };

const WEEKDAY = new Intl.DateTimeFormat("sl-SI", { weekday: "short", timeZone: "UTC" });

/** T-05: daily check-in, one question per screen; end screen once done today. */
export default function CheckinPage({ params }: PageProps<"/patient/[rehabId]/pregled">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Dnevni pregled" back="/patient">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <CheckinScreen params={params} />
    </Suspense>
  );
}

async function CheckinScreen({ params }: Pick<PageProps<"/patient/[rehabId]/pregled">, "params">) {
  const { rehabId } = await params;
  const profile = await requireProfile();
  const ctx = await loadCheckinContext(profile.id, rehabId);
  if (!ctx) notFound();

  const back = `/patient/${ctx.rehab.id}`;
  const shell = (children: React.ReactNode) => (
    <AppShell title="Dnevni pregled" back={back}>
      {children}
    </AppShell>
  );

  if (ctx.todayCheckin) {
    const weightQ = ctx.predloga.vprasanja.find((q) => q.tip === "teza" && ctx.todayCheckin!.answers[q.id] !== undefined);
    const { day, total } = rehabDay(ctx.rehab, ctx.today);
    const [{ ring, extendedUntil }, { meds, logs }] = await Promise.all([
      getRing(ctx.rehab, ctx.predloga, ctx.today, ctx.plan?.nacrt),
      getMedsAndLogs(ctx.rehab.id),
    ]);
    const pills = ctx.active ? slotDueNow(meds, logs, ctx.today) : null;
    return shell(
      <EndScreen
        status={ctx.todayCheckin.triage_status}
        day={day}
        total={total}
        weight={weightQ ? Number(ctx.todayCheckin.answers[weightQ.id]) : undefined}
        target={weightQ ? targetFor(ctx.predloga, weightQ.id, ctx.rehab.patient_values) : undefined}
        trend={weightQ ? weightTrend(weightQ.id, [ctx.todayCheckin, ...ctx.history], ctx.today) : []}
        nextTime={shortTime(profile.checkin_time)}
        backHref={back}
        next={pills ? { href: pillsHref(ctx.rehab.id, pills), label: `Naprej: ${SLOT_ADJ[pills]} tablete` } : undefined}
        ring={<ProgressRing data={ring} extendedUntil={extendedUntil} />}
      />,
    );
  }

  if (!ctx.active) {
    return shell(<p className="rounded-3xl bg-card shadow-soft p-4 text-xl">To okrevanje je zaključeno. Dnevnih pregledov ne pošiljate več.</p>);
  }
  if (!ctx.questions.length) {
    return shell(<p className="rounded-3xl bg-card shadow-soft p-4 text-xl">Za danes nimate vprašanj.</p>);
  }

  return shell(
    <CheckinFlow
      rehabId={ctx.rehab.id}
      today={ctx.today}
      questions={ctx.questions}
      canRepeat={!!ctx.sameSource}
      save={saveCheckin.bind(null, ctx.rehab.id)}
    />,
  );
}

/** "08:00:00" → "8:00" */
function shortTime(t: string) {
  const [h, m = "00"] = t.split(":");
  return `${Number(h)}:${m}`;
}

/** Weight over the last 7 days (oldest first), labelled by weekday. */
function weightTrend(questionId: string, checkins: Checkin[], today: string) {
  const from = addDays(today, -6);
  return checkins
    .filter((c) => c.checkin_date >= from && typeof c.answers[questionId] === "number")
    .sort((a, b) => a.checkin_date.localeCompare(b.checkin_date))
    .map((c) => ({ label: WEEKDAY.format(new Date(`${c.checkin_date}T12:00:00Z`)), kg: c.answers[questionId] as number }));
}
