import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NewQrButton } from "@/components/auth/new-qr-button";
import { ExtendForm } from "@/components/nurse/odpust/extend-form";
import { AppShell, BigButton } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { getPredloga } from "@/lib/templates";
import { extendRehab } from "./actions";

export const metadata = { title: "Rehabilitacija – zDoma" };

/** After opening (T-21): listek for a new patient, "Podaljšaj", "Nova koda QR". */
export default function RehabAdminPage({ params, searchParams }: PageProps<"/nurse/odpust/[rehabId]">) {
  return (
    <AppShell title="Rehabilitacija" back="/nurse">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <RehabAdmin params={params} searchParams={searchParams} />
      </Suspense>
    </AppShell>
  );
}

async function RehabAdmin({ params, searchParams }: PageProps<"/nurse/odpust/[rehabId]">) {
  await requireStaff();
  const [{ rehabId }, sp] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("rehabilitacije")
    .select("id, template_id, status, start_date, end_date, patient_id, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name)")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r || !r.patient) notFound();

  const name = `${r.patient.first_name} ${r.patient.last_name}`;
  const listek = `/prijava/listek/${r.patient_id}`;
  return (
    <>
      {sp.nov !== undefined || sp.napaka !== undefined ? (
        <p className="rounded-xl bg-status-zeleno-bg p-4 text-2xl font-bold text-status-zeleno">Rehabilitacija odprta ✓</p>
      ) : null}
      {sp.napaka !== undefined && (
        <p role="alert" className="rounded-xl bg-status-rdece-bg p-4 text-lg font-semibold text-status-rdece">
          Zdravil ali vaj ni bilo mogoče shraniti. Preverite jih v načrtu.
        </p>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-lg">
        <dt className="text-muted-foreground">Pacient</dt>
        <dd>{name}</dd>
        <dt className="text-muted-foreground">Skupina</dt>
        <dd>{getPredloga(r.template_id)?.ime ?? r.template_id}</dd>
        <dt className="text-muted-foreground">Trajanje</dt>
        <dd>{formatDate(r.start_date)} – {formatDate(r.end_date)}{r.status === "zakljucena" && " (zaključena)"}</dd>
      </dl>

      {sp.nov !== undefined ? (
        <>
          <p className="text-lg">Nov pacient: natisnite prijavni listek s kodo QR. Ne prilagajte ga odpustnici.</p>
          <BigButton href={listek}>Natisni prijavni listek</BigButton>
        </>
      ) : (
        <BigButton href={listek} variant="secondary">Prijavni listek znova</BigButton>
      )}

      <section className="mt-4 flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Podaljšaj</h2>
        <ExtendForm currentEnd={r.end_date} onExtend={extendRehab.bind(null, r.id)} />
      </section>

      <section className="mt-4 flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Izgubljen listek</h2>
        <NewQrButton patientId={r.patient_id} />
      </section>
    </>
  );
}
