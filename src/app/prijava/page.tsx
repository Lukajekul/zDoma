import { Suspense } from "react";
import Link from "next/link";
import { BigButton, Card } from "@/components/shell";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentProfile } from "@/lib/auth";
import { continueHome } from "./actions";
import { LoginChooser } from "./_components/login-chooser";
import { LoginFrame } from "./_components/login-frame";

export default function PrijavaPage() {
  return (
    <LoginFrame title="Dobrodošli nazaj" subtitle="Za osebje in svojce">
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <LoginOrAccount />
      </Suspense>
    </LoginFrame>
  );
}

async function LoginOrAccount() {
  const profile = await getCurrentProfile();

  if (profile) {
    return (
      <Card>
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

  const link = "font-bold text-primary underline underline-offset-4";
  return (
    <>
      <LoginChooser />
      <div className="flex flex-col items-center gap-2 text-center text-lg text-muted-foreground">
        <p>
          Ste svojec brez računa?{" "}
          <Link href="/prijava/registracija" className={link}>Ustvarite račun</Link>
        </p>
        <p>
          Ste pacient?{" "}
          <Link href="/prijava/pacient" className={link}>Prijava za paciente</Link>
        </p>
      </div>
    </>
  );
}
