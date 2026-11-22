import { Suspense } from "react";
import { FamilyObservations } from "@/components/patient/family-observations";
import { StudentAccess } from "@/components/patient/student-access";
import { AppShell, BigButton } from "@/components/shell";
import { requireProfile } from "@/lib/auth";
import { listAccessForPatient, personLabel } from "@/lib/family-access";
import { createClient } from "@/lib/supabase/server";
import { decideAccess } from "./actions";
import { RemoveButton } from "./_components/remove-button";

const MESSAGES: Record<string, { text: string; ok: boolean }> = {
  dovoljeno: { text: "Dostop dovoljen ✓", ok: true },
  student_dovoljen: { text: "Študent vam bo pomagal ✓", ok: true },
  zavrnjeno: { text: "Prošnja zavrnjena ✓", ok: true },
  odstranjeno: { text: "Dostop odstranjen ✓", ok: true },
  napaka: { text: "Ni uspelo. Poskusite znova ali pokličite patronažno sestro.", ok: false },
};

type Props = { searchParams: Promise<{ ok?: string }> };

/** Patient: answer family requests and see who follows their recovery (AGENTS.md §6 "Zadolženec"). */
export default function DostopPage({ searchParams }: Props) {
  return (
    <AppShell title="Svojci" back="/patient">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Message searchParams={searchParams} />
        <AccessList />
      </Suspense>
    </AppShell>
  );
}

async function Message({ searchParams }: Props) {
  const msg = MESSAGES[(await searchParams).ok ?? ""];
  if (!msg) return null;
  return (
    <p
      role="status"
      className={
        msg.ok
          ? "rounded-3xl border-2 border-status-zeleno bg-status-zeleno/10 p-4 text-xl font-bold"
          : "rounded-3xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-xl font-bold"
      }
    >
      {msg.text}
    </p>
  );
}

async function AccessList() {
  const profile = await requireProfile();
  const rows = await listAccessForPatient(await createClient(), profile.id);
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");

  return (
    <>
      <StudentAccess patientId={profile.id} />
      {pending.map((r) => {
        const name = r.person ? personLabel(r.person, r.relation) : "Neznana oseba";
        return (
          <section key={r.id} className="flex flex-col gap-3 rounded-3xl bg-card shadow-lift p-4">
            <p className="text-xl">
              <strong>{name}</strong> želi spremljati vaše okrevanje.
            </p>
            <p className="text-lg text-muted-foreground">
              Ta oseba bo videla vaša zdravila, vaje in dnevne preglede. Ko jih opravite skupaj, jih bo lahko
              označila. Ničesar ne more spremeniti.
            </p>
            <form action={decideAccess} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={r.id} />
              <BigButton type="submit" name="decision" value="approved" variant="success">
                Dovoli
              </BigButton>
              <BigButton type="submit" name="decision" value="rejected" variant="secondary">
                Zavrni
              </BigButton>
            </form>
          </section>
        );
      })}

      <h2 className="mt-2 text-2xl font-bold">Kdo spremlja vaše okrevanje</h2>
      {approved.length === 0 ? (
        <p className="text-xl">Nihče. Svojec lahko zaprosi za dostop v svoji aplikaciji zDoma.</p>
      ) : (
        <ul className="grid items-start gap-4 lg:grid-cols-2">
          {approved.map((r) => {
            const name = r.person ? personLabel(r.person, r.relation) : "Neznana oseba";
            return (
              <li key={r.id} className="flex flex-col gap-3 rounded-3xl bg-card shadow-soft p-4">
                <p className="text-xl font-semibold">{name}</p>
                <RemoveButton id={r.id} name={name} />
              </li>
            );
          })}
        </ul>
      )}
      <FamilyObservations patientId={profile.id} />
    </>
  );
}
