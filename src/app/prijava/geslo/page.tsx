import { Suspense } from "react";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { AppShell, Card, IconTile } from "@/components/shell";
import { getCurrentProfile, homePathFor, PATIENT_LOGIN_PATH } from "@/lib/auth";
import { hasStartingPassword } from "@/lib/qr/accounts";
import { SetPasswordForm } from "../_components/set-password-form";

export const metadata = { title: "Nastavite geslo – zDoma" };

/** Right after the first QR scan (T-54): the patient sets their own password before anything else. */
export default function GesloPage() {
  return (
    <AppShell title="Nastavite svoje geslo" subtitle="Samo prvič" back={false}>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <SetPassword />
      </Suspense>
    </AppShell>
  );
}

async function SetPassword() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(PATIENT_LOGIN_PATH);
  if (profile.is_staff || !(await hasStartingPassword(profile.id))) redirect(await homePathFor(profile));

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <Card lift>
        <p className="text-2xl font-bold">Pozdravljeni, {profile.first_name}.</p>
        <SetPasswordForm />
      </Card>
      <Card>
        <div className="flex items-center gap-4">
          <IconTile><KeyRound /></IconTile>
          <h2 className="text-xl font-bold">Zakaj geslo?</h2>
        </div>
        <ul className="flex list-disc flex-col gap-2 pl-6 text-lg">
          <li>Prijavni listek s kodo QR po tem ne deluje več. Če ga izgubite, ga nihče ne more uporabiti.</li>
          <li>Naslednjič se prijavite z davčno številko in tem geslom. Telefon si prijavo zapomni.</li>
          <li>Geslo si zapišite in ga hranite doma. Če ga pozabite, pokličite patronažno sestro za nov listek.</li>
        </ul>
      </Card>
    </div>
  );
}
