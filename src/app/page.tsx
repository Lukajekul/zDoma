import { AppShell, BigButton } from "@/components/shell";

export default function Home() {
  return (
    <AppShell title="zDoma" back={false}>
      <p className="text-xl">Spremljanje okrevanja na domu po odpustu iz bolnišnice.</p>
      <BigButton href="/patient">Sem pacient</BigButton>
      <BigButton href="/nurse" variant="secondary">
        Sem zdravstveni delavec
      </BigButton>
    </AppShell>
  );
}
