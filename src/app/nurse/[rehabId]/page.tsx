import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PatientOverview } from "@/components/nurse/patient-overview";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { todayLjubljana } from "@/lib/format";
import { getPatientDetail } from "../_lib/patient-detail";

export const metadata = { title: "Podrobnosti pacienta – zDoma" };
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export default function NursePatientPage(props: PageProps<"/nurse/[rehabId]">) {
  return (
    <Suspense fallback={
      <AppShell title="Podrobnosti pacienta" back="/nurse" wide>
        <p role="status">Nalagam podrobnosti …</p>
      </AppShell>
    }>
      <PatientPageContent {...props} />
    </Suspense>
  );
}

async function PatientPageContent({ params, searchParams }: PageProps<"/nurse/[rehabId]">) {
  await requireStaff();
  const { rehabId } = await params;
  if (!uuid.test(rehabId)) notFound();
  const { seznam } = await searchParams;
  const query = typeof seznam === "string" ? new URLSearchParams(seznam).toString() : "";
  const back = query ? `/nurse?${query}` : "/nurse";
  const detail = await getPatientDetail(rehabId, todayLjubljana()).catch(() => undefined);

  if (detail === null) notFound();
  if (!detail) {
    return (
      <AppShell title="Podrobnosti pacienta" back={back} wide>
        <p className="rounded-xl border p-4" role="alert">
          Podrobnosti ni bilo mogoče naložiti. Osvežite stran in poskusite znova.
        </p>
      </AppShell>
    );
  }

  return <PatientOverview detail={detail} back={back} />;
}
