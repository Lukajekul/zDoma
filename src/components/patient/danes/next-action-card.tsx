import { BigButton } from "@/components/shell";
import { minutesToTime, SLOT_ADJ, type DanesAction } from "@/app/patient/_lib/danes";
import type { DoseActionState } from "@/app/patient/[rehabId]/zdravila/actions";
import { SlotTakenButton } from "./slot-taken-button";

type Props = {
  action: DanesAction;
  base: string;
  /** "8:00", the next check-in reminder. */
  nextCheckin: string;
  onSlotTaken?: () => Promise<DoseActionState>;
};

/** The one thing to do now on "Danes", as a big card with one main button. */
export function NextActionCard({ action, base, nextCheckin, onSlotTaken }: Props) {
  const card = "flex flex-col gap-4 rounded-2xl border-2 border-primary p-5";

  switch (action.kind) {
    case "checkin":
      return (
        <section className={card}>
          <h2 className="text-3xl font-bold">{action.weight ? "Stopite na tehtnico" : "Čas za današnji pregled"}</h2>
          <p className="text-xl">{action.weight ? "Nato odgovorite na nekaj vprašanj. " : ""}Traja 30 sekund.</p>
          <BigButton href={`${base}/pregled`}>Začni pregled</BigButton>
        </section>
      );
    case "pills":
      return (
        <section className={card}>
          <h2 className="text-3xl font-bold">Ste vzeli {SLOT_ADJ[action.time]} tablete?</h2>
          <ul className="flex flex-col gap-1 text-xl">
            {action.doses.map((d, i) => (
              <li key={i}>
                <strong>{d.name}</strong> {d.dose}
              </li>
            ))}
          </ul>
          {onSlotTaken && <SlotTakenButton onTake={onSlotTaken} />}
          <BigButton href={`${base}/zdravila`} variant="secondary">
            Označim vsako posebej
          </BigButton>
        </section>
      );
    case "exercise":
      return (
        <section className={card}>
          <h2 className="text-3xl font-bold">Čas za vajo</h2>
          <p className="text-2xl font-semibold">{action.title}</p>
          <BigButton href={`${base}/vaje`}>Odpri vajo</BigButton>
        </section>
      );
    case "later":
      return (
        <section className="flex flex-col gap-3 rounded-2xl bg-status-zeleno-bg p-5 text-status-zeleno">
          <h2 className="text-3xl font-bold">Za zdaj je vse opravljeno ✓</h2>
          <p className="text-xl font-semibold text-foreground">
            Ob {minutesToTime(action.at)}: {SLOT_ADJ[action.time]} tablete.
          </p>
        </section>
      );
    case "done":
      return (
        <section className="flex flex-col gap-3 rounded-2xl bg-status-zeleno-bg p-5 text-status-zeleno">
          <h2 className="text-3xl font-bold">Končano za danes ✓</h2>
          <p className="text-xl font-semibold text-foreground">Jutri ob {nextCheckin}.</p>
        </section>
      );
  }
}
