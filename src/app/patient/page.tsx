import { Suspense } from "react";
import { redirect } from "next/navigation";
import { QuietLogout } from "@/components/auth/quiet-logout";
import { RehabList } from "@/components/patient/rehab-list";
import { AppShell } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { todayLjubljana } from "@/lib/types";
import { autoStartPath } from "./_lib/auto-start";
import { getMyRehabs } from "./_lib/rehabs";

export const metadata = { title: "Moje okrevanje – zDoma" };

/**
 * Patient home (T-25). One active rehabilitacija opens straight away: today's
 * check-in, else pills due now, else "Danes" (T-61). `?seznam=1` always shows
 * the list (link from "Danes").
 */
export default function PatientHomePage({ searchParams }: PageProps<"/patient">) {
  return (
    <AppShell title="Moje okrevanje" back={false}>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <PatientHome searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}

async function PatientHome({ searchParams }: Pick<PageProps<"/patient">, "searchParams">) {
  const profile = await requireProfile();
  const { seznam } = await searchParams;
  const { active, past } = await getMyRehabs(profile.id);

  if (active.length === 1 && !seznam) redirect(await autoStartPath(profile.id, active[0].id));

  return (
    <>
      <RehabList firstName={profile.first_name} active={active} past={past} today={todayLjubljana()} />
      <QuietLogout />
    </>
  );
}
