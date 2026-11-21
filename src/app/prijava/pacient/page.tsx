import { KeyRound, QrCode } from "lucide-react";
import { Card, IconTile } from "@/components/shell";
import { LoginForm } from "../_components/login-form";
import { LoginFrame } from "../_components/login-frame";

export const metadata = { title: "Prijava za paciente – zDoma" };

/** Patient login (T-54): QR ticket the first time, then davčna številka + own password. */
export default function PacientPrijavaPage() {
  return (
    <LoginFrame title="Prijava za paciente" subtitle="Za vaše okrevanje doma">
      <div className="flex flex-col gap-4">
        <Card lift>
          <div className="flex items-center gap-4">
            <IconTile><QrCode /></IconTile>
            <h2 className="text-xl font-bold">Prvič?</h2>
          </div>
          <ol className="flex list-decimal flex-col gap-2 pl-6 text-lg">
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
            <h2 className="text-xl font-bold">Že imate svoje geslo?</h2>
          </div>
          <LoginForm />
          <p className="text-lg text-muted-foreground">Ste pozabili geslo? Patronažna sestra vam natisne nov listek.</p>
        </Card>
      </div>
    </LoginFrame>
  );
}
