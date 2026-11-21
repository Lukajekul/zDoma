"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { DavcnaField, FormError } from "@/app/prijava/_components/fields";
import { RELATIONS } from "@/lib/family-access";
import { cn } from "@/lib/utils";
import { requestAccess, type RequestState } from "../actions";

const chip =
  "flex min-h-14 cursor-pointer items-center justify-center rounded-xl border-2 border-border bg-background px-4 text-xl font-semibold capitalize select-none " +
  "has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground " +
  "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring";

export function RequestForm() {
  const [state, action, pending] = useActionState<RequestState, FormData>(requestAccess, {});

  if (state.sent) {
    return (
      <div className="flex flex-col gap-4">
        <p
          role="status"
          className="rounded-xl border-2 border-status-zeleno bg-status-zeleno/10 p-5 text-2xl font-bold"
        >
          Prošnja poslana ✓
        </p>
        <p className="text-xl">
          Ko jo bo pacient odobril, ga boste videli pod »Skrbim za«. Do takrat ne vidite nobenih podatkov.
        </p>
        <BigButton href="/carer">Nazaj na Skrbim za</BigButton>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <FormError message={state.error} />
      <DavcnaField key={state.davcna} defaultValue={state.davcna} />
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-lg font-semibold">Kdo ste pacientu? (ni obvezno)</legend>
        <div className="grid grid-cols-2 gap-3">
          {RELATIONS.map((r) => (
            <label key={r} className={cn(chip, r === "drugo" && "col-span-2")}>
              <input type="radio" name="relation" value={r} className="sr-only" />
              {r}
            </label>
          ))}
        </div>
      </fieldset>
      <BigButton type="submit" disabled={pending}>
        {pending ? "Pošiljam …" : "Pošlji prošnjo"}
      </BigButton>
    </form>
  );
}
