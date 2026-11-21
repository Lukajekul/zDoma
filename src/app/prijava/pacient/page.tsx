import { KeyRound, QrCode } from "lucide-react";
import { AppShell, Card, IconTile } from "@/components/shell";
import { LoginForm } from "../_components/login-form";

export const metadata = { title: "Prijava za paciente – zDoma" };

/** Patient login (T-54): QR ticket the first time, then davčna številka + own password. */
export default function PacientPrijavaPage() {
  return (
    <AppShell title="Prijava za paciente" subtitle="Za vaše okrevanje doma" back="/">
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card lift>
          <div className="flex items-center gap-4">
            <IconTile><QrCode /></IconTile>
            <h2 className="text-2xl font-bold">Prvič?</h2>
          </div>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-xl">
            <li>Odprite kamero na telefonu.</li>
            <li>Usmerite jo v kodo QR na prijavnem listku, ki ste ga dobili ob odpustu.</li>
            <li>Tapnite povezavo, ki se pokaže.</li>
            <li>Nastavite svoje geslo.</li>
          </ol>
          <p className="text-lg text-muted-foreground">Listka nimate? Pokličite patronažno sestro.</p>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <IconTile ghost><KeyRound /></IconTile>
            <h2 className="text-2xl font-bold">Že imate svoje geslo?</h2>
          </div>
          <LoginForm />
          <p className="text-lg text-muted-foreground">Ste pozabili geslo? Patronažna sestra vam natisne nov listek.</p>
        </Card>
      </div>
    </AppShell>
  );
}
