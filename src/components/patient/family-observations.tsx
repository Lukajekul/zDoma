import { formatDate } from "@/lib/format";
import { getObservations } from "@/lib/observations-server";
import { createClient } from "@/lib/supabase/server";
import { isRehabActive, todayLjubljana, type Rehabilitacija } from "@/lib/types";

/**
 * T-73: what approved zadolženci noticed, shown to the patient so nothing is
 * reported behind their back. No status colours here: alerts are for staff only.
 */
export async function FamilyObservations({ patientId }: { patientId: string }) {
  const supabase = await createClient();
  const { data } = await supabase.from("rehabilitacije").select("*").eq("patient_id", patientId);
  const today = todayLjubljana();
  const active = ((data ?? []) as Rehabilitacija[]).filter((r) => isRehabActive(r, today));
  const lists = await Promise.all(active.map((r) => getObservations(r, 5).catch(() => [])));
  const items = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  if (!items.length) return null;

  return (
    <section aria-labelledby="opazanja-svojcev" className="flex flex-col gap-3">
      <h2 id="opazanja-svojcev" className="mt-2 text-2xl font-bold">Kaj so opazili svojci</h2>
      <ul className="flex flex-col gap-3">
        {items.map((o) => (
          <li key={o.id} className="flex flex-col gap-2 rounded-3xl bg-card shadow-soft p-4 text-lg">
            <p className="font-semibold">
              {formatDate(o.createdAt)} · Opazil(a): {o.by}
            </p>
            {o.chips.length > 0 && <p>{o.chips.join(" · ")}</p>}
            {o.note && <p className="whitespace-pre-wrap break-words">„{o.note}“</p>}
            <p className="text-muted-foreground">{o.read ? "Sestra je prebrala ✓" : "Sestra bo pogledala."}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
