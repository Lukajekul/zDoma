import "server-only";

import { getPredloga } from "@/lib/templates";
import { createClient } from "@/lib/supabase/server";
import type { DashboardRow } from "@/components/nurse/dashboard-filters";

const pageSize = 250;
const dayMs = 86_400_000;

export async function getDashboardRows(today: string): Promise<DashboardRow[] | null> {
  const supabase = await createClient();
  const rows: DashboardRow[] = [];
  const staleUnread = await getStaleUnreadObservations(supabase);

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
      // T-73: an observation nobody read for 24 h brings the patient onto the list.
      const unreadSince = staleUnread.get(rehab.id) ?? null;
      const oldestAlertMs = alerts.reduce<number | null>(
        (oldest, alert) => Math.min(oldest ?? Infinity, Date.parse(alert.created_at)),
        unreadSince,
      );

      rows.push({
        id: rehab.id,
        name: [first_name, last_name].filter(Boolean).join(" ") || "Pacient brez imena",
        davcna,
        municipality: obcina,
        place: naselje,
        nurseId: rehab.assigned_nurse_id,
        status: topAlert?.status ?? (unreadSince !== null && rehab.current_status === "zeleno" ? "rumeno" : rehab.current_status),
        reason: topAlert?.reason ?? (unreadSince !== null ? unreadReason : null),
        oldestAlertMs,
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

const unreadReason = "Neprebrano opažanje svojca";

/** Rehab id → time (ms) of its oldest observation still unread after 24 hours. */
async function getStaleUnreadObservations(supabase: Awaited<ReturnType<typeof createClient>>) {
  const cutoff = new Date(Date.now() - dayMs).toISOString();
  const { data } = await supabase
    .from("carer_observations")
    .select("rehab_id, created_at")
    .is("read_at", null)
    .lt("created_at", cutoff);
  const oldest = new Map<string, number>();
  for (const o of data ?? []) {
    const t = Date.parse(o.created_at);
    oldest.set(o.rehab_id, Math.min(oldest.get(o.rehab_id) ?? Infinity, t));
  }
  return oldest;
}
