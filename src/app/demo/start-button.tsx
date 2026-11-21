"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { startDemo, type DemoState } from "./actions";

export function StartButton() {
  const [state, action, pending] = useActionState<DemoState>(startDemo, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error && (
        <p role="alert" className="rounded-3xl border-2 border-status-rdece bg-status-rdece/10 p-4 text-lg font-semibold">
          {state.error}
        </p>
      )}
      <BigButton type="submit" disabled={pending}>
        {pending ? "Pripravljam vašega pacienta …" : "Začni kot pacient"}
      </BigButton>
    </form>
  );
}
