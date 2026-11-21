"use client";

import { useActionState } from "react";
import { BigButton } from "@/components/shell";
import { login, type FormState } from "../actions";
import { DavcnaField, FormError, PasswordField } from "./fields";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <FormError message={state.error} />
      <DavcnaField key={state.values?.davcna} defaultValue={state.values?.davcna} />
      <PasswordField autoComplete="current-password" />
      <BigButton type="submit" disabled={pending}>
        {pending ? "Prijavljam …" : "Prijava"}
      </BigButton>
    </form>
  );
}
