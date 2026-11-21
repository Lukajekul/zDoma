import { Suspense } from "react";
import { SubstitutionForm } from "@/components/nurse/substitution-form";
import { AppShell } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { todayLjubljana } from "@/lib/types";
import { getNurseData } from "../odpust/_lib/data";
import { cancelSubstitution, createSubstitution } from "../_patronaza/actions";

export const metadata = { title: "Nadomeščanje – zDoma" };

/** T-36 (c): hand a nurse's patients to a colleague until a date. */
export default function SubstitutionPage() {
  return (
    <AppShell title="Nadomeščanje" back="/nurse" width="medium">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Substitution />
      </Suspense>
    </AppShell>
  );
}

async function Substitution() {
  const staff = await requireStaff();
  const today = todayLjubljana();
  const { nurses } = await getNurseData();
  const supabase = await createClient();
  const { data: active } = await supabase
    .from("nadomescanje")
    .select("id, nurse_id, substitute_id, until_date")
    .gte("until_date", today)
    .order("until_date");
  const name = (id: string) => nurses.find((n) => n.id === id)?.name ?? "—";

  return (
    <>
      <p className="text-lg">Vsi pacienti izbrane sestre gredo sodelavki do datuma. Potem se vrnejo sami.</p>
      <SubstitutionForm nurses={nurses.map(({ id, name }) => ({ id, name }))} me={staff.id} today={today} onCreate={createSubstitution} />

      <h2 className="mt-4 text-2xl font-bold">Trenutna nadomeščanja</h2>
      {!active?.length && <p className="text-lg text-muted-foreground">Ni nadomeščanj.</p>}
      <ul className="flex flex-col gap-2">
        {active?.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-3xl bg-card shadow-soft p-3 text-lg">
            <span>{name(s.nurse_id)} → {name(s.substitute_id)}, do {formatDate(s.until_date)}</span>
            <form action={async () => { "use server"; await cancelSubstitution(s.id); }}>
              <button type="submit" className="min-h-12 rounded-xl bg-card shadow-soft px-4 font-semibold hover:bg-muted">Prekliči</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
