"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { register, type FormState } from "../actions";
import { DavcnaField, Field, FormError, PasswordField } from "./fields";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <Field key={`f${v.first_name}`} label="Ime" name="first_name" autoComplete="given-name" required defaultValue={v.first_name} />
      <Field key={`l${v.last_name}`} label="Priimek" name="last_name" autoComplete="family-name" required defaultValue={v.last_name} />
      <DavcnaField key={`d${v.davcna}`} defaultValue={v.davcna} />
      <PasswordField label="Izberite geslo" hint="Vsaj 8 znakov" autoComplete="new-password" />
      <BigButton type="submit" disabled={pending}>
        {pending ? "Ustvarjam račun …" : "Ustvari račun"}
      </BigButton>
    </form>
  );
}
