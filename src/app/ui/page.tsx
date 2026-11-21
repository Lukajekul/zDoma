import { Check, Phone } from "lucide-react";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { formatDate, formatLongDate, formatNumber, formatTime } from "@/lib/format";

export const metadata = { title: "Gradniki – zDoma" };

/** Living reference of the shared UI kit (T-01). Not linked from the app. */
export default function UiKitPage() {
  const now = new Date("2026-11-21T07:00:00Z"); // fixed sample: 8:00 in Ljubljana
  return (
    <AppShell title="Gradniki" back="/">
      <h2 className="text-2xl font-bold">Stanje</h2>
      <StatusBadge status="zeleno" />
      <StatusBadge status="rumeno" />
      <StatusBadge status="rdece" />
      <div className="flex gap-2">
        <StatusBadge status="rdece" short />
        <StatusBadge status="zeleno" label="pregled opravljen" />
      </div>

      <h2 className="mt-4 text-2xl font-bold">Gumbi</h2>
      <BigButton icon={<Check />}>Vzeto</BigButton>
      <BigButton variant="secondary">Enako kot včeraj</BigButton>
      <BigButton variant="success">Opravljeno</BigButton>
      <BigButton variant="danger" icon={<Phone />} href="tel:112">
        Pokličite 112
      </BigButton>
      <BigButton disabled>Ni na voljo</BigButton>

      <h2 className="mt-4 text-2xl font-bold">Oblike</h2>
      <p>
        {formatLongDate(now)} · {formatDate(now)} · {formatTime(now)} · {formatNumber(74.5)} kg
      </p>
      <p className="text-muted-foreground">Pomožno besedilo je še vedno 18 px in dobro berljivo.</p>
    </AppShell>
  );
}
