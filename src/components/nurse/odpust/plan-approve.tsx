"use client";

import { useState, useTransition } from "react";
import type { OdobritevVnos } from "@/app/nurse/odpust/_lib/dejstva";
import { PlanReview } from "./plan-review";

type Props = { initial: OdobritevVnos; brezAtc: string[]; onApprove: (v: OdobritevVnos) => Promise<{ error: string }> };

/** Plan review for an existing rehabilitacija; the action redirects on success. */
export function PlanApprove({ initial, brezAtc, onApprove }: Props) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string>();
  const [saving, start] = useTransition();
  const approve = () =>
    start(async () => {
      setError(undefined);
      const res = await onApprove(value);
      if (res?.error) setError(res.error);
    });
  return <PlanReview value={value} brezAtc={brezAtc} onChange={setValue} onApprove={approve} approveLabel="Odobri načrt" saving={saving} error={error} />;
}
