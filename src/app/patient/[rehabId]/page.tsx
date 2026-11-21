import { Suspense } from "react";
import { notFound } from "next/navigation";
import { rehabDay, rehabTitle } from "@/components/patient/rehab-info";
import { AppShell, BigButton } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana } from "@/lib/types";
import { loadCheckinContext } from "../_lib/checkins";
import { getMyRehab } from "../_lib/rehabs";
import { DanesView } from "./danes-view";

const BACK = "/patient?seznam=1";

/**
 * One rehabilitacija. Active → "Danes" (T-33): today's next action.
 * Finished → read-only summary, no check-ins.
 */
export default function RehabPage({ params }: PageProps<"/patient/[rehabId]">) {
  return (
    <Suspense
      fallback={
        <AppShell title="Okrevanje" back={BACK}>
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Rehab params={params} />
    </Suspense>
  );
}

async function Rehab({ params }: Pick<PageProps<"/patient/[rehabId]">, "params">) {
  const { rehabId } = await params;
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) notFound();

  const today = todayLjubljana();
  const { total } = rehabDay(rehab, today);

  if (isRehabActive(rehab, today)) {
    const ctx = await loadCheckinContext(profile.id, rehab.id);
    if (!ctx) notFound();
    return <DanesView ctx={ctx} profile={profile} back={BACK} />;
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("checkins")
    .select("id", { count: "exact", head: true })
    .eq("rehab_id", rehab.id);

  return (
    <AppShell title={rehabTitle(rehab)} back={BACK}>
      <p className="rounded-xl bg-muted p-4 text-xl">
        To okrevanje je zaključeno {formatDate(rehab.end_date)}. Pregledov ne pošiljate več, podatke
        pa lahko še vedno pregledate.
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xl">
        <dt className="text-muted-foreground">Začetek</dt>
        <dd>{formatDate(rehab.start_date)}</dd>
        <dt className="text-muted-foreground">Konec</dt>
        <dd>{formatDate(rehab.end_date)}</dd>
        <dt className="text-muted-foreground">Pregledov</dt>
        <dd>{count ?? 0} od {total} dni</dd>
      </dl>
      <BigButton href={`/patient/${rehab.id}/zdravila`} variant="secondary">
        Zdravila
      </BigButton>
      <BigButton href={`/patient/${rehab.id}/vaje`} variant="secondary">
        Vaje
      </BigButton>
      <BigButton href={BACK} variant="secondary">
        Vsa okrevanja
      </BigButton>
    </AppShell>
  );
}
