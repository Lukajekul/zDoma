import { CalendarClock, Check, ClipboardCheck, Dumbbell, Pill, Scale } from "lucide-react";
import { BigButton, Card, IconTile } from "@/components/shell";
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

function Head({ icon, title, sub, done = false }: { icon: React.ReactNode; title: string; sub?: React.ReactNode; done?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <IconTile ghost={!done}>{icon}</IconTile>
      <div>
        <h2 className="text-xl leading-tight font-bold">{title}</h2>
        {sub && <p className="text-base text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/** The one thing to do now on "Danes", as a card with one main button. */
export function NextActionCard({ action, base, nextCheckin, onSlotTaken }: Props) {
  switch (action.kind) {
    case "checkin":
      return (
        <>
          <Card>
            <Head
              icon={action.weight ? <Scale /> : <ClipboardCheck />}
              title={action.weight ? "Stopite na tehtnico" : "Današnji pregled"}
              sub={`${action.weight ? "Nato nekaj vprašanj. " : ""}Traja 30 sekund.`}
            />
          </Card>
          <BigButton href={`${base}/pregled`}>Začni pregled</BigButton>
        </>
      );
    case "pills":
      return (
        <Card lift>
          <Head icon={<Pill />} title={`Ste vzeli ${SLOT_ADJ[action.time]} tablete?`} />
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
        </Card>
      );
    case "exercise":
      return (
        <Card lift>
          <Head icon={<Dumbbell />} title="Čas za vajo" sub={action.title} />
          <BigButton href={`${base}/vaje`}>Odpri vajo</BigButton>
        </Card>
      );
    case "later":
      return (
        <Card>
          <Head done icon={<CalendarClock />} title="Za zdaj je vse opravljeno ✓" sub={`Ob ${minutesToTime(action.at)}: ${SLOT_ADJ[action.time]} tablete.`} />
        </Card>
      );
    case "done":
      return (
        <Card>
          <Head done icon={<Check />} title="Končano za danes ✓" sub={`Jutri ob ${nextCheckin}.`} />
        </Card>
      );
  }
}
