import { Suspense } from "react";
import { Razporedi } from "@/components/nurse/studenti/razporedi";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { todayLjubljana } from "@/lib/types";
import { getRazporedi } from "./_lib/data";

export const metadata = { title: "Razporedi študente – zDoma" };

/** T-98: the patronažna sestra assigns študenti pomočniki by need, on a list and a map. */
export default function StudentiPage() {
  return (
    <AppShell title="Razporedi študente" back="/nurse" wide>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Content />
      </Suspense>
    </AppShell>
  );
}

async function Content() {
  const staff = await requireStaff();
  const data = await getRazporedi(staff.id, todayLjubljana());
  if (!data) return <p role="alert" className="text-xl">Seznama ni bilo mogoče naložiti. Osvežite stran.</p>;
  return <Razporedi patients={data.patients} students={data.students} />;
}
