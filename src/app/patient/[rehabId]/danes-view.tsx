import { cookies } from "next/headers";
import Link from "next/link";
import { NextActionCard } from "@/components/patient/danes/next-action-card";
import { NurseUpdateCard } from "@/components/patient/danes/nurse-update-card";
import { ProgressRing } from "@/components/patient/progress-ring";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { AppShell, BigButton } from "@/components/shell";
import { countPendingRequests } from "@/lib/family-access";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import type { loadCheckinContext } from "../_lib/checkins";
import { groupChanges, seenCookie } from "../_lib/changes";
import { nextAction, nowMinutesLjubljana } from "../_lib/danes";
import { getMedsAndLogs, logMissedDoses } from "../_lib/doses";
import { getExercisesForDay } from "../_lib/exercises";
import { getMyNurse } from "../_lib/nurse";
import { getLatestNurseUpdate } from "../_lib/nurse-update";
import { getRing } from "../_lib/ring";
import { dosesOn } from "../_lib/schedule";
import { markSlotTaken } from "./zdravila/actions";

type Ctx = NonNullable<Awaited<ReturnType<typeof loadCheckinContext>>>;

const smallLink =
  "inline-flex min-h-12 items-center rounded-lg px-3 text-lg font-semibold text-primary underline underline-offset-4 hover:bg-muted";

/** T-33: today's next action, one at a time, plus small links below. */
export async function DanesView({ ctx, profile, back }: { ctx: Ctx; profile: Profile; back: string }) {
  const { rehab, today } = ctx;
  const base = `/patient/${rehab.id}`;
  const supabase = await createClient();

  const [{ meds, logs: loaded }, exercises, pending, { ring, extendedUntil }, nurse, nurseUpdate] = await Promise.all([

    getMedsAndLogs(rehab.id),
    getExercisesForDay(rehab, today),
    countPendingRequests(supabase, profile.id),
    getRing(rehab, ctx.predloga, today),
    getMyNurse(rehab.assigned_nurse_id, today),
    getLatestNurseUpdate(supabase, rehab.id),
  ]);
  const logs = await logMissedDoses(rehab, meds, loaded, today);

  const action = nextAction({
    checkinDone: !!ctx.todayCheckin,
    hasQuestions: ctx.questions.length > 0,
    startsWithWeight: ctx.questions[0]?.kind === "teza",
    doseGroups: dosesOn(meds, logs, today),
    exercises: exercises.map((e) => ({
      title: e.content?.naslov ?? e.exercise.title,
      remaining: e.exercise.times_per_day - e.logs.length,
    })),
    nowMinutes: nowMinutesLjubljana(),
  });
  const changes = groupChanges(meds);
  const showChanges = changes.any && !(await cookies()).get(seenCookie(rehab.id));
  const { day, total } = rehabDay(rehab, today);
  const [h, m = "00"] = profile.checkin_time.split(":");

  return (
    <AppShell title="Danes" back={back}>
      <p className="text-xl">
        <strong>{rehabTitle(rehab)}</strong> · Dan {day} od {total}
      </p>

      {nurse && (
        <p className="text-lg">
          Vaša patronažna sestra: <strong>{nurse.nurse}</strong>
          {nurse.substitute && (
            <span className="block">
              Do {formatDate(nurse.substitute.until)} vas obiskuje <strong>{nurse.substitute.name}</strong>.
            </span>
          )}
        </p>
      )}

      {pending > 0 && (
        <Link href="/patient/dostop" className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-xl font-semibold text-status-rumeno">
          {pending === 1 ? "Nekdo želi spremljati vaše okrevanje." : `${pending} osebe želijo spremljati vaše okrevanje.`}{" "}
          <span className="underline">Poglejte</span>
        </Link>
      )}

      {showChanges && (
        // T-35: medicine changes come before anything else until the patient taps "Razumem".
        <section className="flex flex-col gap-4 rounded-2xl border-2 border-primary p-5">
          <h2 className="text-3xl font-bold">Vaša zdravila so se spremenila</h2>
          <p className="text-xl">
            {[
              changes.novo.length && `Novo: ${changes.novo.length}`,
              changes.spremenjeno.length && `Spremenjeno: ${changes.spremenjeno.length}`,
              changes.ukinjeno.length && `Ukinjeno: ${changes.ukinjeno.length}`,
            ].filter(Boolean).join(" · ")}
          </p>
          <BigButton href={`${base}/spremembe`}>Poglejte spremembe</BigButton>
        </section>
      )}

      {nurseUpdate && <NurseUpdateCard update={nurseUpdate} />}

      {!showChanges && (
        <NextActionCard
          action={action}
          base={base}
          nextCheckin={`${Number(h)}:${m}`}
          onSlotTaken={action.kind === "pills" ? markSlotTaken.bind(null, rehab.id, action.time) : undefined}
        />
      )}

      <ProgressRing data={ring} extendedUntil={extendedUntil} />

      <nav aria-label="Več" className="mt-4 flex flex-wrap gap-x-2 gap-y-1">
        <Link href={`${base}/pregled`} className={smallLink}>Pregled</Link>
        <Link href={`${base}/zdravila`} className={smallLink}>Vse tablete</Link>
        <Link href={`${base}/vaje`} className={smallLink}>Vaje</Link>
        {changes.any && <Link href={`${base}/spremembe`} className={smallLink}>Spremembe zdravil</Link>}
        <Link href="/patient/dostop" className={smallLink}>Družina</Link>
        <Link href="/patient/opomnik" className={smallLink}>Opomnik</Link>
      </nav>
    </AppShell>
  );
}
