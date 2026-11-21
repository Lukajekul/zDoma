import { Suspense } from "react";
import { DischargeWizard } from "@/components/nurse/odpust/wizard";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { getPrilagojenePredloge } from "@/lib/templates/server";
import { todayLjubljana } from "@/lib/types";
import { getNurseData, medicineCatalogue } from "./_lib/data";

export const metadata = { title: "Nova rehabilitacija – zDoma" };

/** T-21: open a rehabilitacija at discharge. */
export default function DischargePage() {
  return (
    <AppShell title="Nova rehabilitacija" back="/nurse">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Wizard />
      </Suspense>
    </AppShell>
  );
}

async function Wizard() {
  await requireStaff();
  const [{ nurses, subs }, templates] = await Promise.all([getNurseData(), getPrilagojenePredloge()]);
  return <DischargeWizard today={todayLjubljana()} nurses={nurses} subs={subs} catalogue={medicineCatalogue()} templates={templates} />;
}
