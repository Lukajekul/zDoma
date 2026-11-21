"use client";

import { useActionState, useState } from "react";
import { BigButton } from "@/components/shell";
import { Field, ErrorText } from "./ui";

type State = { error?: string; ok?: boolean };

/** "Podaljšaj": pick a new end date, one button. */
export function ExtendForm({ currentEnd, onExtend }: { currentEnd: string; onExtend: (newEnd: string) => Promise<State> }) {
  const [end, setEnd] = useState("");
  const [state, action, pending] = useActionState<State>(() => onExtend(end), {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <Field label="Nov konec" type="date" value={end} onChange={setEnd} />
      <BigButton type="submit" variant="secondary" disabled={pending || !end || end <= currentEnd}>
        {pending ? "Shranjujem …" : "Podaljšaj"}
      </BigButton>
      {state.ok && <p className="rounded-lg bg-status-zeleno-bg p-3 text-lg font-semibold text-status-zeleno">Podaljšano ✓</p>}
      <ErrorText>{state.error}</ErrorText>
    </form>
  );
}
