"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { resolveAlert } from "@/app/nurse/[rehabId]/actions";
import type { PatientDetail } from "@/app/nurse/_lib/patient-detail";
import { StatusBadge } from "@/components/shell";
import { formatDate, formatTime } from "@/lib/format";
import { alertOutcomes, isAlertOutcome } from "./alert-outcomes";
import type { AlertOutcome } from "./alert-outcomes";

const feedback = {
  saved: "Ukrep shranjen ✓",
  unavailable: "Opozorilo ni več na voljo za ukrep. Seznam je osvežen.",
  invalid: "Izbranega ukrepa ni bilo mogoče prepoznati.",
  error: "Ukrep ni bil shranjen. Poskusite znova.",
} as const;

export function PatientAlerts({ active, openAlerts, closedAlerts }: Pick<
  PatientDetail, "active" | "openAlerts" | "closedAlerts"
>) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<keyof typeof feedback>();

  function save(id: string, outcome: AlertOutcome) {
    setMessage(undefined);
    startTransition(async () => {
      try {
        setMessage(await resolveAlert(id, outcome));
        router.refresh();
      } catch {
        setMessage("error");
      }
    });
  }

  return (
    <section aria-labelledby="opozorila" className="space-y-3">
      <h2 className="text-xl font-bold" id="opozorila">Odprta opozorila ({openAlerts.length})</h2>
      {message && (
        <p className="rounded-xl border bg-muted p-3 font-semibold" role={message === "saved" ? "status" : "alert"}>
          {feedback[message]}
        </p>
      )}
      {pending && <p role="status">Shranjujem ukrep …</p>}
      {openAlerts.length === 0 ? <p>Ni odprtih opozoril.</p> : (
        <ul className="space-y-3">
          {openAlerts.map((alert) => (
            <li className="space-y-3 rounded-2xl border p-4" key={alert.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="wrap-break-word font-bold">{alert.reason}</h3>
                <StatusBadge short status={alert.status} />
              </div>
              <p className="text-muted-foreground">Odprto {formatDate(alert.created_at)} ob {formatTime(alert.created_at)}</p>
              {active && (
                <fieldset className="flex flex-wrap gap-2" disabled={pending}>
                  <legend className="mb-2 font-semibold">Zabeleži ukrep</legend>
                  {Object.entries(alertOutcomes).map(([value, label]) => (
                    <button
                      className="min-h-12 max-w-full rounded-xl border-2 border-primary px-3 py-2 text-left font-semibold text-primary hover:bg-primary/10 disabled:opacity-60"
                      key={value}
                      onClick={() => {
                        if (isAlertOutcome(value)) save(alert.id, value);
                      }}
                      type="button"
                    >
                      {label}
                    </button>
                  ))}
                </fieldset>
              )}
            </li>
          ))}
        </ul>
      )}
      {closedAlerts.length > 0 && (
        <details className="rounded-2xl border">
          <summary className="min-h-12 cursor-pointer px-4 py-3 font-semibold">Zadnja zaprta opozorila</summary>
          <ul className="divide-y px-4 pb-2">
            {closedAlerts.map((alert) => (
              <li className="space-y-1 py-3 wrap-break-word" key={alert.id}>
                <p className="font-medium">{alert.reason}</p>
                {alert.action && <p>{isAlertOutcome(alert.action) ? alertOutcomes[alert.action] : alert.action}</p>}
                {alert.resolved_at && (
                  <p className="text-muted-foreground">{formatDate(alert.resolved_at)} ob {formatTime(alert.resolved_at)}</p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
