import { MessageSquare, Phone } from "lucide-react";
import { AppShell, BigButton } from "@/components/shell";

export const metadata = { title: "Pregled brez aplikacije – zDoma" };

/** T-14 mock-up entry: check-in by SMS or by an automated phone call. */
export default function MockupPage() {
  return (
    <AppShell title="Pregled brez aplikacije" back="/">
      <p className="text-xl">
        Za ljudi brez pametnega telefona. Isti dnevni pregled po SMS ali po telefonu: vsak odgovor je
        ena številka.
      </p>
      <p className="rounded-3xl bg-card shadow-soft p-4 text-muted-foreground">
        To je prikaz. Nič se ne pošlje in nič se ne shrani.
      </p>
      <BigButton href="/patient/mockup/sms" icon={<MessageSquare />}>
        Pregled po SMS
      </BigButton>
      <BigButton href="/patient/mockup/telefon" icon={<Phone />} variant="secondary">
        Pregled po telefonu
      </BigButton>
    </AppShell>
  );
}
