import { Suspense } from "react";
import { UserPlus } from "lucide-react";
import { AppShell, BigButton } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProfile } from "@/lib/auth";
import { listAccessForCarer, personLabel } from "@/lib/family-access";
import { createClient } from "@/lib/supabase/server";

// "Skrbim za" home for a zadolženec. T-26 lists access; T-20 adds the per-patient view.
export default function CarerPage() {
  return (
    <AppShell title="Skrbim za" back={false}>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <CarerHome />
      </Suspense>
      <div className="mt-auto flex flex-col gap-3 border-t-2 pt-6">
        <BigButton href="/carer/zaprosi" variant="secondary" icon={<UserPlus />}>
          Zaprosi za dostop
        </BigButton>
        <LogoutButton />
      </div>
    </AppShell>
  );
}

async function CarerHome() {
  const profile = await requireProfile();
  const rows = await listAccessForCarer(await createClient(), profile.id);
  const approved = rows.filter((r) => r.status === "approved" && r.person);
  const pending = rows.filter((r) => r.status === "pending").length;

  return (
    <>
      {approved.length === 0 ? (
        <p className="text-xl">
          Še nikogar ne spremljate. Zaprosite za dostop z davčno številko osebe, ki ji pomagate.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {approved.map((r) => (
            <li key={r.id} className="rounded-xl border-2 border-border p-4 text-xl font-semibold">
              {personLabel(r.person!, null)}
            </li>
          ))}
        </ul>
      )}
      {pending > 0 && (
        <p className="rounded-xl border-2 border-border bg-muted/50 p-4 text-xl">
          {pending === 1 ? "1 prošnja čaka na odobritev." : `Prošnje, ki čakajo na odobritev: ${pending}`}
        </p>
      )}
    </>
  );
}
