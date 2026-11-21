import { cookies } from "next/headers";
import Link from "next/link";
import { NextActionCard } from "@/components/patient/danes/next-action-card";
import { NurseUpdateCard } from "@/components/patient/danes/nurse-update-card";
import { ProgressRing } from "@/components/patient/progress-ring";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { Activity, Bell, ClipboardCheck, Phone, Pill, RefreshCw, Users } from "lucide-react";
import { AppShell, BigButton, Card, IconTile } from "@/components/shell";
import { countPendingRequests } from "@/lib/family-access";
import { formatDate, formatShortDay, greeting } from "@/lib/format";
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

  const links = [
    { href: `${base}/pregled`, label: "Pregled", hint: "Današnja vprašanja", Icon: ClipboardCheck },
    { href: `${base}/zdravila`, label: "Vse tablete", hint: "Kdaj in koliko", Icon: Pill },
    { href: `${base}/vaje`, label: "Vaje", hint: "Za danes", Icon: Activity },
    ...(changes.any ? [{ href: `${base}/spremembe`, label: "Spremembe zdravil", hint: "Novo in ukinjeno", Icon: RefreshCw }] : []),
    { href: "/patient/dostop", label: "Družina", hint: "Kdo vam pomaga", Icon: Users },
    { href: "/patient/opomnik", label: "Opomnik", hint: `Vsak dan ob ${Number(h)}:${m}`, Icon: Bell },
  ];

  return (
    <AppShell
      title={`${greeting()}, ${profile.first_name}`}
      subtitle={`${rehabTitle(rehab)} · Dan ${day} od ${total}`}
      aside={formatShortDay()}
      back={back}
      hero={
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <Card lift className="items-center">
            <ProgressRing data={ring} extendedUntil={extendedUntil} />
          </Card>
          <div className="flex flex-col gap-4 lg:mt-14">
            {showChanges ? (
              // T-35: medicine changes come before anything else until the patient taps "Razumem".
              <Card lift>
                <div className="flex items-center gap-4">
                  <IconTile><Pill /></IconTile>
                  <h2 className="text-2xl leading-tight font-bold">Vaša zdravila so se spremenila</h2>
                </div>
                <p className="text-xl">
                  {[
                    changes.novo.length && `Novo: ${changes.novo.length}`,
                    changes.spremenjeno.length && `Spremenjeno: ${changes.spremenjeno.length}`,
                    changes.ukinjeno.length && `Ukinjeno: ${changes.ukinjeno.length}`,
                  ].filter(Boolean).join(" · ")}
                </p>
                <BigButton href={`${base}/spremembe`}>Poglejte spremembe</BigButton>
              </Card>
            ) : (
              <NextActionCard
                action={action}
                base={base}
                nextCheckin={`${Number(h)}:${m}`}
                onSlotTaken={action.kind === "pills" ? markSlotTaken.bind(null, rehab.id, action.time) : undefined}
              />
            )}
            {pending > 0 && (
              <Link href="/patient/dostop" className="flex items-center gap-4 rounded-3xl bg-status-rumeno-bg p-5 text-xl font-semibold text-status-rumeno">
                <IconTile tone="rumeno"><Users /></IconTile>
                <span>
                  {pending === 1 ? "Nekdo želi spremljati vaše okrevanje." : `${pending} osebe želijo spremljati vaše okrevanje.`}{" "}
                  <span className="underline underline-offset-4">Poglejte</span>
                </span>
              </Link>
            )}
            {nurseUpdate && <NurseUpdateCard update={nurseUpdate} />}
            {nurse && (
              <Card className="flex-row items-center">
                <IconTile ghost><Phone /></IconTile>
                <p className="text-lg">
                  <span className="block text-muted-foreground">Vaša patronažna sestra</span>
                  <strong className="text-xl">{nurse.nurse}</strong>
                  {nurse.substitute && (
                    <span className="block">
                      Do {formatDate(nurse.substitute.until)} vas obiskuje <strong>{nurse.substitute.name}</strong>.
                    </span>
                  )}
                </p>
              </Card>
            )}
          </div>
        </div>
      }
    >
      <h2 className="mt-2 text-xl font-bold">Več</h2>
      <nav aria-label="Več" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, label, hint, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex min-h-20 items-center gap-4 rounded-3xl bg-card p-4 shadow-soft hover:shadow-lift focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <IconTile ghost><Icon /></IconTile>
            <span className="flex flex-col">
              <span className="text-xl font-bold">{label}</span>
              <span className="text-base text-muted-foreground">{hint}</span>
            </span>
          </Link>
        ))}
      </nav>
    </AppShell>
  );
}
