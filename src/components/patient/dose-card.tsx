"use client";

import { useActionState } from "react";
import { Check, Undo2 } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { DoseActionState } from "@/app/patient/[rehabId]/zdravila/actions";

type DoseCardProps = {
  name: string;
  dose: string;
  purpose: string | null;
  /** "vzeto" = taken today; null = not yet. */
  taken: boolean;
  /** Who marked it, when it wasn't the patient ("Označila: Ana"). */
  markedBy?: string;
  /** Undo only for entries the user made. */
  canUndo: boolean;
  onTake: () => Promise<DoseActionState>;
  onUndo: () => Promise<DoseActionState>;
};

/** One medication at one time of day, with a big "Vzeto" or "Vzeto ✓ / Razveljavi". */
export function DoseCard({ name, dose, purpose, taken, markedBy, canUndo, onTake, onUndo }: DoseCardProps) {
  const [takeState, take, taking] = useActionState<DoseActionState>(onTake, {});
  const [undoState, undo, undoing] = useActionState<DoseActionState>(onUndo, {});
  const error = takeState.error ?? undoState.error;

  return (
    <li className="flex flex-col gap-3 rounded-3xl bg-card shadow-soft p-4">
      <div>
        <p className="text-2xl font-bold">
          {name} <span className="font-semibold">{dose}</span>
        </p>
        {purpose && <p className="text-lg text-muted-foreground">Za: {purpose}</p>}
      </div>

      {taken ? (
        <div className="flex flex-col gap-2">
          <p className="flex min-h-14 flex-col justify-center rounded-xl bg-status-zeleno-bg px-4 py-2 text-xl font-bold text-status-zeleno">
            <span>Vzeto ✓</span>
            {markedBy && <span className="text-lg font-semibold">Označeno: {markedBy}</span>}
          </p>
          {canUndo && (
            <form action={undo}>
              <button
                type="submit"
                disabled={undoing}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-card shadow-soft px-4 text-lg font-semibold hover:bg-muted disabled:opacity-50"
              >
                <Undo2 aria-hidden className="size-6" />
                {undoing ? "Razveljavljam …" : "Razveljavi"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <form action={take}>
          <BigButton type="submit" icon={<Check />} disabled={taking}>
            {taking ? "Shranjujem …" : "Vzeto"}
          </BigButton>
        </form>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
          {error}
        </p>
      )}
    </li>
  );
}
