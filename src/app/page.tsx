import { HeartPulse, Stethoscope } from "lucide-react";
import { AppShell, BigButton, Card, IconTile } from "@/components/shell";

export default function Home() {
  return (
    <AppShell title="Dobrodošli v zDoma" subtitle="Okrevanje doma po odpustu iz bolnišnice" back={false}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <IconTile><HeartPulse /></IconTile>
            <h2 className="text-2xl font-bold">Sem pacient</h2>
          </div>
          <p className="text-lg text-muted-foreground">Vsak dan kratek pregled, vaša zdravila in vaje.</p>
          <BigButton href="/patient" className="mt-auto">Naprej kot pacient</BigButton>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <IconTile ghost><Stethoscope /></IconTile>
            <h2 className="text-2xl font-bold">Sem zdravstveni delavec</h2>
          </div>
          <p className="text-lg text-muted-foreground">Pacienti, ki potrebujejo pozornost, in nova rehabilitacija.</p>
          <BigButton href="/nurse" variant="secondary" className="mt-auto">Naprej kot osebje</BigButton>
        </Card>
      </div>
    </AppShell>
  );
}
