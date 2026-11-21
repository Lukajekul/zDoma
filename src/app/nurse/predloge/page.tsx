import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { AppShell, BigButton } from "@/components/shell";
import { requireStaff } from "@/lib/auth";
import { seznamPredlog } from "@/lib/templates";
import { jePrazna } from "@/lib/templates/overrides";
import { getPrilagoditve } from "@/lib/templates/server";

export const metadata = { title: "Predloge – zDoma" };

/** T-24: the six templates; staff can change each one's plan defaults. */
export default function TemplatesPage() {
  return (
    <AppShell title="Predloge" back="/nurse">
      <p className="text-lg">
        Tukaj spremenite privzeto trajanje, privzeta vprašanja in vaje za nove rehabilitacije. Opozorilna pravila,
        pragovi in zdravila so zaklenjeni, ker izhajajo iz smernic.
      </p>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <List />
      </Suspense>
      <BigButton href="/nurse/predloge/zgodovina" variant="secondary" icon={<History />}>
        Zgodovina sprememb
      </BigButton>
    </AppShell>
  );
}

async function List() {
  await requireStaff();
  const prilagoditve = await getPrilagoditve();
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {seznamPredlog.map((p) => {
        const o = prilagoditve[p.id];
        const spremenjena = !!o && !jePrazna(p, o.prilagoditev);
        return (
          <li key={p.id}>
            <Link
              href={`/nurse/predloge/${p.id}`}
              className="flex min-h-16 items-center gap-3 rounded-xl border-2 border-border p-4 hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="flex flex-1 flex-col">
                <span className="text-xl font-semibold">{p.ime}</span>
                <span className="text-lg text-muted-foreground">{spremenjena ? "Prilagojeno" : "Izvirne nastavitve"}</span>
              </span>
              <span className="flex items-center text-lg font-semibold text-primary">
                Uredi <ChevronRight aria-hidden className="size-7" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
