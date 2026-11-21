import { AppShell } from "@/components/shell";
import { SmsCheckin } from "@/components/patient/mockup/sms-checkin";

export const metadata = { title: "Pregled po SMS – zDoma" };

export default function SmsMockupPage() {
  return (
    <AppShell title="Pregled po SMS" back="/patient/mockup">
      <p className="text-muted-foreground">Prikaz: Janez odgovori z eno številko. Nič se ne shrani.</p>
      <SmsCheckin />
    </AppShell>
  );
}
