import { AppShell } from "@/components/shell";
import { QrLogin } from "./qr-login";

export default function QrLoginPage() {
  return (
    <AppShell title="Prijava s kodo QR" back="/prijava/pacient">
      <QrLogin />
    </AppShell>
  );
}
