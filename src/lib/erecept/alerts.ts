import "server-only";

// Staff alerts for medicines not picked up (T-31). Idempotent: run it as often
// as you like (dashboard load, demo switch, later the daily cron in T-39/T-45).
import { createAdminClient } from "@/lib/supabase/admin";
import { oceniPrevzem, prevzemDosegel, prevzemRazlog } from "@/lib/triage";
import { todayLjubljana, type Uuid } from "@/lib/types";
import { erecept } from ".";

/**
 * Opens one "rumeno" alert per medicine that reached the staff step
 * ("Furosemid ni prevzet 3 dni po odpustu"), keeps its day count current, and
 * closes it once the medicine is picked up. Server only: call it from staff
 * pages or scheduled jobs, never with user input.
 */
export async function syncPickupAlerts(rehabIds?: Uuid[]): Promise<{ odprta: number; zaprta: number }> {
  const admin = createAdminClient();
  const today = todayLjubljana();

  let rehabQuery = admin.from("rehabilitacije").select("id, start_date").eq("status", "aktivna").gte("end_date", today);
  if (rehabIds) rehabQuery = rehabQuery.in("id", rehabIds);
  const { data: rehabs, error } = await rehabQuery;
  if (error) throw new Error(error.message);
  if (rehabs.length === 0) return { odprta: 0, zaprta: 0 };

  const ids = rehabs.map((r) => r.id);
  const [{ data: meds }, { data: open }] = await Promise.all([
    admin.from("medications").select("id, rehab_id, name, change").in("rehab_id", ids),
    admin
      .from("alerts")
      .select("id, medication_id")
      .in("rehab_id", ids)
      .eq("source", "zdravila")
      .eq("state", "odprto")
      .not("medication_id", "is", null),
  ]);
  const prevzemi = await erecept.prevzemi((meds ?? []).map((m) => m.id));
  const openByMed = new Map((open ?? []).map((a) => [a.medication_id as string, a.id]));

  let odprta = 0;
  let zaprta = 0;
  for (const rehab of rehabs) {
    const zdravila = (meds ?? [])
      .filter((m) => m.rehab_id === rehab.id)
      .map((m) => ({ ...m, picked_up_at: prevzemi.get(m.id)?.datum ?? null }));

    for (const o of oceniPrevzem(zdravila, rehab.start_date, today)) {
      const alertId = openByMed.get(o.zdraviloId);
      if (prevzemDosegel(o, "osebje")) {
        if (alertId) {
          await admin.from("alerts").update({ reason: prevzemRazlog(o) }).eq("id", alertId);
        } else {
          const { error: e } = await admin.from("alerts").insert({
            rehab_id: rehab.id,
            medication_id: o.zdraviloId,
            status: "rumeno",
            source: "zdravila",
            reason: prevzemRazlog(o),
          });
          if (!e) odprta++;
          else if (e.code !== "23505") throw new Error(e.message); // 23505: opened concurrently
        }
      } else if (alertId) {
        await admin
          .from("alerts")
          .update({
            state: "zaprto",
            action: o.stopnja === "v-redu" ? "Prevzeto v lekarni" : "Ni več potrebno",
            resolved_at: new Date().toISOString(),
          })
          .eq("id", alertId);
        zaprta++;
      }
    }
  }
  return { odprta, zaprta };
}
