import { Suspense } from "react";
import { QrCode, UserPlus } from "lucide-react";
import { AppShell, BigButton, Card, IconTile } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentProfile } from "@/lib/auth";
import { continueHome } from "./actions";
import { LoginForm } from "./_components/login-form";

export default function PrijavaPage() {
  return (
    <AppShell title="Dobrodošli nazaj" subtitle="Prijava v zDoma" back="/">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <LoginOrAccount />
      </Suspense>
    </AppShell>
  );
}

async function LoginOrAccount() {
  const profile = await getCurrentProfile();

  if (profile) {
    return (
      <Card className="max-w-xl">
        <p className="rounded-2xl bg-status-zeleno-bg p-4 text-xl text-status-zeleno">
          Prijavljeni ste kot <strong>{profile.first_name} {profile.last_name}</strong> ✓
        </p>
        <form action={continueHome}>
          <BigButton type="submit">Naprej</BigButton>
        </form>
        <LogoutButton />
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
      <Card lift>
        <div>
          <h2 className="text-2xl font-bold text-primary">Za osebje in svojce</h2>
          <p className="text-lg text-muted-foreground">Z davčno številko in geslom.</p>
        </div>
        <LoginForm />
      </Card>
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <IconTile><QrCode /></IconTile>
            <h2 className="text-xl font-bold">Ste pacient?</h2>
          </div>
          <p className="text-lg">
            Gesla ne potrebujete. S kamero telefona skenirajte kodo QR na prijavnem listku, ki ste ga dobili ob odpustu.
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <IconTile ghost><UserPlus /></IconTile>
            <h2 className="text-xl font-bold">Ste svojec brez računa?</h2>
          </div>
          <BigButton href="/prijava/registracija" variant="secondary">
            Ustvari račun za svojce
          </BigButton>
        </Card>
      </div>
    </div>
  );
}
