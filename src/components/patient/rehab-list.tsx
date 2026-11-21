import type { IsoDate, Rehabilitacija } from "@/lib/types";
import { RehabCard } from "./rehab-card";

type RehabListProps = { firstName: string; active: Rehabilitacija[]; past: Rehabilitacija[]; today: IsoDate };

/** Patient home content: active rehabilitacije as big cards, then "Pretekle rehabilitacije". */
export function RehabList({ firstName, active, past, today }: RehabListProps) {
  return (
    <>
      <p className="text-xl">Pozdravljeni, {firstName}.</p>

      {active.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-bold">
            {active.length === 1 ? "Vaše okrevanje" : "Izberite okrevanje"}
          </h2>
          {active.map((r) => (
            <RehabCard key={r.id} rehab={r} today={today} />
          ))}
        </section>
      ) : (
        <p className="rounded-xl bg-muted p-4 text-xl">
          Trenutno nimate odprtega okrevanja. Ko vas odpustijo iz bolnišnice, se bo pojavilo tukaj.
        </p>
      )}

      {past.length > 0 && (
        <section className="mt-4 flex flex-col gap-3">
          <h2 className="text-2xl font-bold">Pretekle rehabilitacije</h2>
          <p className="text-lg text-muted-foreground">Te lahko samo pregledate.</p>
          {past.map((r) => (
            <RehabCard key={r.id} rehab={r} today={today} past />
          ))}
        </section>
      )}
    </>
  );
}
