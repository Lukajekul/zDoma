"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { DoseActionState } from "@/app/patient/[rehabId]/zdravila/actions";

/** "Da, vzeto": marks every open dose of this time of day in one tap. */
export function SlotTakenButton({ onTake }: { onTake: () => Promise<DoseActionState> }) {
  const [state, take, pending] = useActionState<DoseActionState>(onTake, {});
  return (
    <form action={take} className="flex flex-col gap-3">
      <BigButton type="submit" icon={<Check />} disabled={pending}>
        {pending ? "Shranjujem …" : "Da, vzeto"}
      </BigButton>
      {state.error && (
        <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
          {state.error}
        </p>
      )}
    </form>
  );
}
