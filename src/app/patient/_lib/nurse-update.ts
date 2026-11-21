import "server-only";

import { isAlertOutcome, type AlertOutcome } from "@/components/nurse/alert-outcomes";
import type { createClient } from "@/lib/supabase/server";

const messages = {
  contacted_all_ok: "Vaši podatki so pregledani ✓",
  visit_booked: "Za vas je naročen pregled.",
  gp_notified: "Vaš osebni zdravnik je obveščen o vašem okrevanju.",
  plan_adjusted: "Načrt okrevanja je bil prilagojen.",
} satisfies Record<AlertOutcome, string>;

export async function getLatestNurseUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rehabId: string,
) {
  const { data, error } = await supabase
    .from("alerts")
    .select("action, resolved_at, author:staff_directory!alerts_resolved_by_fkey(first_name, last_name, photo_url)")
    .eq("rehab_id", rehabId)
    .eq("state", "zaprto")
    .in("action", Object.keys(messages))
    .not("resolved_at", "is", null)
    .order("resolved_at", { ascending: false })
    .order("id")
    .limit(1)
    .maybeSingle();

  if (error || !data?.resolved_at || !isAlertOutcome(data.action)) return null;

  const names = [data.author?.first_name?.trim(), data.author?.last_name?.trim()]
    .filter((name): name is string => Boolean(name));
  const photoUrl = data.author?.photo_url?.trim();
  const safePhotoUrl = photoUrl && (/^https:\/\//i.test(photoUrl) || /^\/(?![\/\\])/.test(photoUrl))
    ? photoUrl
    : null;

  return {
    author: names.join(" ") || "Zdravstvena ekipa",
    initials: names.map((name) => [...name][0]).join("").toLocaleUpperCase("sl-SI") || "ZE",
    photoUrl: safePhotoUrl,
    text: messages[data.action],
    date: data.resolved_at,
  };
}

export type NurseUpdate = NonNullable<Awaited<ReturnType<typeof getLatestNurseUpdate>>>;
