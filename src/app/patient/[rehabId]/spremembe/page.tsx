import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MedicineChanges } from "@/components/patient/medicine-changes";
import { AppShell, BigButton } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { getMedsAndLogs } from "../../_lib/doses";
import { getMyRehab } from "../../_lib/rehabs";
import { acknowledgeChanges } from "./actions";

export const metadata = { title: "Spremembe zdravil – zDoma" };

/** T-35: Novo / Spremenjeno / Ukinjeno against the medicines before admission. */
export default function ChangesPage({ params }: PageProps<"/patient/[rehabId]/spremembe">) {
  return (
    <Suspense fallback={<AppShell title="Spremembe zdravil" back="/patient"><p className="text-xl">Nalagam …</p></AppShell>}>
      <Changes params={params} />
    </Suspense>
  );
}

async function Changes({ params }: Pick<PageProps<"/patient/[rehabId]/spremembe">, "params">) {
  const { rehabId } = await params;
  const profile = await requireProfile();
  const rehab = await getMyRehab(profile.id, rehabId);
  if (!rehab) notFound();
  const { meds } = await getMedsAndLogs(rehab.id);

  return (
    <AppShell title="Spremembe zdravil" back={`/patient/${rehab.id}`}>
      <p className="text-xl">V bolnišnici so vam spremenili zdravila. Preberite, kaj je novo.</p>

      <MedicineChanges meds={meds} />

      <p className="text-lg text-muted-foreground">Če vam kaj ni jasno, pokličite patronažno sestro ali osebnega zdravnika.</p>
      <form action={acknowledgeChanges.bind(null, rehab.id)}>
        <BigButton type="submit">Razumem</BigButton>
      </form>
    </AppShell>
  );
}
