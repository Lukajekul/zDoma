import { Suspense } from "react";
import { AppShell, BigButton } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { syncPickupAlerts } from "@/lib/erecept/alerts";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { oceniPrevzem, type PrevzemStopnja } from "@/lib/triage";
import { todayLjubljana } from "@/lib/types";
import { setPickedUp } from "./actions";

export const metadata = { title: "Demo: prevzem zdravil – zDoma" };

const KORAK: Record<PrevzemStopnja, string> = {
  "v-redu": "Prevzeto ✓",
  caka: "Ni prevzeto – še čakamo",
  pacient: "Ni prevzeto – opomnik pacientu",
  zadolzenec: "Ni prevzeto – obveščen svojec",
  osebje: "Ni prevzeto – opozorilo sestri",
};

/** T-31 demo switch: mark medicines picked up / not picked up in the mock eRecept. Staff only. */
export default function DemoZdravilaPage() {
  return (
    <AppShell title="Demo: prevzem zdravil" back="/" wide>
      <p className="text-xl">
        Namesto eRecepta (CEZIH) tukaj ročno označite, ali je pacient zdravilo prevzel v lekarni.
      </p>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <MedicineList />
      </Suspense>
    </AppShell>
  );
}

async function MedicineList() {
  await requireStaff();
  const today = todayLjubljana();
  await syncPickupAlerts();

  const supabase = await createClient();
  const { data: rehabs } = await supabase
    .from("rehabilitacije")
    .select("id, start_date, patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name), medications(id, name, dose, change, picked_up_at)")
    .eq("status", "aktivna")
    .gte("end_date", today)
    .order("start_date", { ascending: false });

  const rows = (rehabs ?? [])
    .map((r) => ({ ...r, ocene: oceniPrevzem(r.medications, r.start_date, today) }))
    .filter((r) => r.ocene.length > 0);

  if (rows.length === 0) {
    return <p className="rounded-xl bg-muted p-4 text-xl">Ni aktivnih rehabilitacij z novimi ali spremenjenimi zdravili.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {rows.map((r) => (
        <li key={r.id} className="flex flex-col gap-3 rounded-xl border-2 border-border p-4">
          <h2 className="text-2xl font-bold">
            {r.patient?.first_name} {r.patient?.last_name}
          </h2>
          <p className="text-lg">Odpust {formatDate(r.start_date)}</p>
          <ul className="flex flex-col gap-3">
            {r.ocene.map((o) => {
              const med = r.medications.find((m) => m.id === o.zdraviloId)!;
              const prevzeto = o.stopnja === "v-redu";
              return (
                <li key={o.zdraviloId} className="flex flex-col gap-2 border-t-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xl font-semibold">
                      {med.name} {med.dose}
                    </p>
                    <p className="text-lg">
                      {KORAK[o.stopnja]}
                      {med.picked_up_at && ` (${formatDate(med.picked_up_at)})`}
                    </p>
                  </div>
                  <form action={setPickedUp.bind(null, r.id, o.zdraviloId, !prevzeto)} className="sm:w-72">
                    <BigButton type="submit" variant={prevzeto ? "secondary" : "success"}>
                      {prevzeto ? "Označi: ni prevzeto" : "Označi: prevzeto"}
                    </BigButton>
                  </form>
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
}
