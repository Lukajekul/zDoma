import { AppShell } from "@/components/shell";
import { PhoneCheckin } from "@/components/patient/mockup/phone-checkin";

export const metadata = { title: "Pregled po telefonu – zDoma" };

export default function PhoneMockupPage() {
  return (
    <AppShell title="Pregled po telefonu" back="/patient/mockup">
      <p className="text-muted-foreground">
        Prikaz: zDoma pokliče Janeza, on pritisne tipko. Nič se ne shrani.
      </p>
      <PhoneCheckin />
    </AppShell>
  );
}
