"use client";

import { useState } from "react";
import { BigButton } from "@/components/shell";
import { removeAccess } from "../actions";

/** "Odstrani" with a second, explicit confirmation step. */
export function RemoveButton({ id, name }: { id: string; name: string }) {
  const [asking, setAsking] = useState(false);

  if (!asking) {
    return (
      <BigButton variant="secondary" onClick={() => setAsking(true)}>
        Odstrani
      </BigButton>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-status-rdece p-4">
      <p className="text-xl font-semibold">
        Odstranim osebo {name}? Ta oseba ne bo več videla vašega okrevanja.
      </p>
      <form action={removeAccess}>
        <input type="hidden" name="id" value={id} />
        <BigButton type="submit" variant="danger">
          Da, odstrani
        </BigButton>
      </form>
      <BigButton variant="secondary" onClick={() => setAsking(false)}>
        Ne, pusti
      </BigButton>
    </div>
  );
}
