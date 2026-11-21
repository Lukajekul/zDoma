import { Suspense } from "react";
import { AppShell, BigButton } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentProfile } from "@/lib/auth";
import { continueHome } from "./actions";
import { LoginForm } from "./_components/login-form";

export default function PrijavaPage() {
  return (
    <AppShell title="Prijava" back="/">
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
      <>
        <p className="rounded-xl border-2 border-status-zeleno bg-status-zeleno/10 p-4 text-xl">
          Prijavljeni ste kot <strong>{profile.first_name} {profile.last_name}</strong> ✓
        </p>
        <form action={continueHome}>
          <BigButton type="submit">Naprej</BigButton>
        </form>
        <LogoutButton />
      </>
    );
  }

  return (
    <>
      <section className="rounded-xl border-2 border-border bg-muted/50 p-4 text-lg">
        <h2 className="text-xl font-bold">Ste pacient?</h2>
        <p className="mt-1">
          Gesla ne potrebujete. S kamero telefona skenirajte kodo QR na prijavnem listku, ki ste ga dobili ob
          odpustu.
        </p>
      </section>

      <p className="text-xl">Za zdravstvene delavce in svojce:</p>
      <LoginForm />

      <div className="mt-4 flex flex-col gap-3 border-t-2 pt-6">
        <p className="text-xl">Ste svojec in še nimate računa?</p>
        <BigButton href="/prijava/registracija" variant="secondary">
          Ustvari račun za svojce
        </BigButton>
      </div>
    </>
  );
}
