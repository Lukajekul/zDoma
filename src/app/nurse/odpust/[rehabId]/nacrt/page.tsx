import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PlanApprove } from "@/components/nurse/odpust/plan-approve";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getApprovedPlan, getPatientFacts } from "@/lib/plans-server";
import { createClient } from "@/lib/supabase/server";
import { zacetnaDejstva } from "../../_lib/dejstva";
import { approvePlan } from "./actions";

export const metadata = { title: "Načrt vprašanj – zDoma" };
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

/** Compose and approve the modular plan for an existing rehabilitacija (T-79). */
export default function PlanPage({ params }: PageProps<"/nurse/odpust/[rehabId]/nacrt">) {
  return (
    <Suspense fallback={<AppShell title="Načrt vprašanj" back="/nurse" width="medium"><p className="text-xl">Nalagam …</p></AppShell>}>
      <PlanContent params={params} />
    </Suspense>
  );
}

async function PlanContent({ params }: Pick<PageProps<"/nurse/odpust/[rehabId]/nacrt">, "params">) {
  await requireStaff();
  const { rehabId } = await params;
  if (!uuid.test(rehabId)) notFound();
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("rehabilitacije")
    .select("id, template_id, status, start_date, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name)")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r || !r.patient) notFound();
  const back = `/nurse/odpust/${rehabId}`;

  const [{ data: meds }, facts, current] = await Promise.all([
    supabase.from("medications").select("name, active_substance, change").eq("rehab_id", rehabId),
    getPatientFacts(rehabId).catch(() => null),
    getApprovedPlan(rehabId).catch(() => null),
  ]);
  const taken = (meds ?? []).filter((m) => m.change !== "ukinjeno").map((m) => ({ name: m.name, activeSubstance: m.active_substance }));
  const pre = zacetnaDejstva(r.template_id, taken, r.start_date);

  return (
    <AppShell title="Načrt vprašanj" subtitle={`${r.patient.first_name} ${r.patient.last_name}`} back={back} width="medium">
      {current ? (
        <p className="rounded-2xl bg-card p-4 text-lg shadow-soft">
          Velja različica {current.version}{current.plan.odobril && `, odobril/a ${current.plan.odobril}`}, {formatDate(current.approved_at)}.
          Ob potrditvi nastane nova različica.
        </p>
      ) : (
        <p className="rounded-2xl bg-card p-4 text-lg shadow-soft">Ta rehabilitacija še nima odobrenega načrta. Zdaj uporablja vprašanja predloge.</p>
      )}
      {r.status !== "aktivna" ? (
        <p role="alert" className="text-lg font-semibold">Rehabilitacija ni aktivna. Načrta ni mogoče spremeniti.</p>
      ) : (
        <PlanApprove
          initial={{ dejstva: facts ?? pre.dejstva, odstrani: current?.plan.odstranjeno ?? [] }}
          brezAtc={pre.brezAtc}
          onApprove={approvePlan.bind(null, rehabId)}
        />
      )}
    </AppShell>
  );
}
