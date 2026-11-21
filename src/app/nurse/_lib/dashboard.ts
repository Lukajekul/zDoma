import "server-only";

import { getPredloga } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import type { DashboardRow } from "@/components/nurse/dashboard-filters";

const pageSize = 250;
const dayMs = 86_400_000;

export async function getDashboardRows(today: string): Promise<DashboardRow[] | null> {
  const supabase = await createClient();
  const rows: DashboardRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("rehabilitacije")
      .select(`
        id, template_id, current_status, assigned_nurse_id, start_date,
        patient:profiles!rehabilitacije_patient_id_fkey(first_name, last_name, davcna, obcina, naselje),
        alerts(status, source, reason, created_at)
      `)
      .eq("status", "aktivna")
      .lte("start_date", today)
      .gte("end_date", today)
      .eq("alerts.state", "odprto")
      .order("id")
      .range(offset, offset + pageSize - 1);

    if (error) return null;

    for (const rehab of data) {
      if (!rehab.patient) continue;
      const { first_name, last_name, davcna, obcina, naselje } = rehab.patient;
      const { alerts } = rehab;
      const topAlert = [...alerts].sort((a, b) =>
        (a.status === "rdece" ? 0 : 1) - (b.status === "rdece" ? 0 : 1)
        || Date.parse(a.created_at) - Date.parse(b.created_at),
      )[0];

      rows.push({
        id: rehab.id,
        name: [first_name, last_name].filter(Boolean).join(" ") || "Pacient brez imena",
        davcna,
        municipality: obcina,
        place: naselje,
        nurseId: rehab.assigned_nurse_id,
        status: topAlert?.status ?? rehab.current_status,
        reason: topAlert?.reason ?? null,
        oldestAlertMs: alerts.reduce<number | null>(
          (oldest, alert) => Math.min(oldest ?? Infinity, Date.parse(alert.created_at)),
          null,
        ),
        missedCheckin: alerts.some((alert) => alert.source === "brez_pregleda"),
        medicineUncollected: alerts.some((alert) => alert.source === "zdravila"),
        templateId: rehab.template_id,
        templateLabel: getPredloga(rehab.template_id)?.ime ?? rehab.template_id,
        daysSinceDischarge: (Date.parse(today) - Date.parse(rehab.start_date)) / dayMs,
      });
    }

    if (data.length < pageSize) return rows;
  }
}
