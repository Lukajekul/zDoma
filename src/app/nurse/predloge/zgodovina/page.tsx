import { Suspense } from "react";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate, formatTime } from "@/lib/format";
import { getPredloga } from "@/lib/templates";
import { opisSpremembe, preberiPrilagoditev } from "@/lib/templates/overrides";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Zgodovina sprememb predlog – zDoma" };

/** T-24: audit log of template edits (who, when, what changed). */
export default function TemplateHistoryPage() {
  return (
    <AppShell title="Zgodovina sprememb" back="/nurse/predloge" wide>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <History />
      </Suspense>
    </AppShell>
  );
}

async function History() {
  await requireStaff();
  const supabase = await createClient();
  const [{ data: rows }, { data: staff }] = await Promise.all([
    supabase.from("audit_log").select("id, actor_id, details, created_at").eq("action", "template.edit").order("created_at", { ascending: false }).limit(100),
    supabase.from("staff_directory").select("id, first_name, last_name"),
  ]);
  const ime = (id: string | null) => {
    const s = staff?.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name}` : "Neznan uporabnik";
  };

  if (!rows?.length) return <p className="text-xl">Predlog še nihče ni spremenil.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => {
        const d = (r.details ?? {}) as Record<string, unknown>;
        const p = getPredloga(String(d.template_id ?? ""));
        return (
          <li key={r.id} className="flex flex-col gap-1 rounded-3xl bg-card shadow-soft p-4">
            <p className="text-lg text-muted-foreground">
              {formatDate(r.created_at)} ob {formatTime(r.created_at)} · {ime(r.actor_id)}
            </p>
            <p className="text-xl font-semibold">{p?.ime ?? "Neznana predloga"}</p>
            {p && (
              <ul className="list-disc pl-6 text-lg">
                {opisSpremembe(p, preberiPrilagoditev(d.prej), preberiPrilagoditev(d.potem)).map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
