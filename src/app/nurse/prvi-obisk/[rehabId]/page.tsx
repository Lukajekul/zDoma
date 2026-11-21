import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoginQr } from "@/components/auth/login-qr";
import { FirstVisitChecklist } from "@/components/nurse/first-visit-checklist";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { markInstalled } from "../../_patronaza/actions";

export const metadata = { title: "Prvi obisk – zDoma" };

/** T-36 (b): first home visit checklist, ends with "Nameščeno ✓". */
export default function FirstVisitPage({ params }: PageProps<"/nurse/prvi-obisk/[rehabId]">) {
  return (
    <AppShell title="Prvi obisk" back="/nurse/danes">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <FirstVisit params={params} />
      </Suspense>
    </AppShell>
  );
}

async function FirstVisit({ params }: Pick<PageProps<"/nurse/prvi-obisk/[rehabId]">, "params">) {
  await requireStaff();
  const { rehabId } = await params;
  const supabase = await createClient();
  const { data: r } = await supabase
    .from("rehabilitacije")
    .select("id, patient_id, installed_at, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name)")
    .eq("id", rehabId)
    .maybeSingle();
  if (!r || !r.patient) notFound();
  const { count } = await supabase.from("checkins").select("id", { count: "exact", head: true }).eq("rehab_id", r.id);

  if (r.installed_at) {
    return (
      <p className="rounded-xl bg-status-zeleno-bg p-4 text-xl font-semibold text-status-zeleno">
        {r.patient.first_name} {r.patient.last_name}: nameščeno {formatDate(r.installed_at)} ✓
      </p>
    );
  }

  return (
    <>
      <p className="text-xl">{r.patient.first_name} {r.patient.last_name}. Pojdite skozi korake skupaj s pacientom, na njegovem telefonu.</p>
      <FirstVisitChecklist
        onInstalled={markInstalled.bind(null, r.id)}
        steps={[
          {
            id: "prijava",
            title: "Prijava na telefonu pacienta",
            body: (
              <div className="flex flex-col gap-3">
                <p>Pacient s kamero telefona skenira kodo QR na prijavnem listku in je prijavljen. Če listka ni pri roki, naj skenira to kodo:</p>
                <Suspense fallback={<p>Nalagam kodo …</p>}>
                  <LoginQr patientId={r.patient_id} />
                </Suspense>
              </div>
            ),
          },
          {
            id: "zaslon",
            title: "zDoma na začetni zaslon",
            body: (
              <ul className="list-disc pl-6">
                <li>Android (Chrome): meni ⋮ → »Dodaj na začetni zaslon«.</li>
                <li>iPhone (Safari): gumb Deli → »Dodaj na začetni zaslon«. Brez tega iPhone ne pošilja obvestil.</li>
              </ul>
            ),
          },
          {
            id: "obvestila",
            title: "Dovolite obvestila",
            body: <p>Ko zDoma vpraša za obvestila, tapnite »Dovoli«. Opomnik za pregled pride vsak dan ob 8:00.</p>,
          },
          {
            id: "pregled",
            title: "Prvi pregled skupaj",
            body: count ? <p>Pacient je pregled že opravil ✓</p> : <p>Na pacientovem telefonu odprite »Danes« in skupaj opravite današnji pregled.</p>,
            done: !!count,
          },
        ]}
      />
    </>
  );
}
