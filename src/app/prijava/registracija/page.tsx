import { AppShell } from "@/components/shell";
import { RegisterForm } from "../_components/register-form";

export default function RegistracijaPage() {
  return (
    <AppShell title="Račun za svojce" back="/prijava">
      <p className="text-xl">
        Z računom lahko spremljate okrevanje svojca. Ko ga ustvarite, svojca zaprosite za dostop. Podatke vidite
        šele, ko vam ga odobri.
      </p>
      <p className="text-lg text-muted-foreground">Pacienti dobijo račun ob odpustu: prvič se prijavijo s kodo QR na prijavnem listku.</p>
      <RegisterForm />
    </AppShell>
  );
}
