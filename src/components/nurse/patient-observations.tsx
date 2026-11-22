"use client";

import { useState, useTransition } from "react";
import { markObservationRead } from "@/app/nurse/[rehabId]/actions";
import { BigButton, StatusBadge } from "@/components/shell";
import { formatDate, formatTime } from "@/lib/format";
import type { ObservationView } from "@/lib/observations-server";

/** T-73: "Opažanja svojcev" on the patient detail, newest first, with one-tap "Prebrano". */
export function PatientObservations({ observations }: { observations: ObservationView[] | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (observations === null) {
    return <p className="rounded-3xl bg-card p-4 shadow-soft" role="alert">Opažanj svojcev ni bilo mogoče naložiti. Osvežite stran.</p>;
  }
  if (!observations.length) return null;

  const unread = observations.filter((o) => !o.read).length;
  const read = (id: string) => start(async () => {
    setError(null);
    const r = await markObservationRead(id);
    if (r.error) setError(r.error);
  });

  return (
    <section aria-labelledby="opazanja" className="flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-soft">
      <h2 className="text-xl font-bold" id="opazanja">
        Opažanja svojcev{unread > 0 && ` · ${unread} ${unread === 1 ? "novo" : "novih"}`}
      </h2>
      {error && <p role="alert" className="font-semibold text-status-rdece">{error}</p>}
      <ul className="flex flex-col gap-3">
        {observations.map((o) => (
          <li
            key={o.id}
            className={o.read ? "rounded-2xl border-2 border-border p-3" : "rounded-2xl border-2 border-primary bg-brand-soft/40 p-3"}
          >
            <div className="flex flex-wrap items-center gap-2">
              {!o.read && <span className="rounded-full bg-primary px-3 py-0.5 text-sm font-bold text-primary-foreground">Novo</span>}
              <p className="font-semibold">
                {formatDate(o.createdAt)} ob {formatTime(o.createdAt)} · Opazil(a): {o.by}
              </p>
              {o.status !== "zeleno" && <StatusBadge short status={o.status} />}
            </div>
            {o.chips.length > 0 && (
              <ul className="mt-2 list-disc pl-6">
                {o.chips.map((c) => <li key={c}>{c}</li>)}
              </ul>
            )}
            {o.note && <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-muted p-3">„{o.note}“</p>}
            {o.concern && <p className="mt-2 font-semibold">Svojec prosi, da sestra pogleda.</p>}
            {!o.read && (
              <BigButton variant="secondary" className="mt-3 sm:max-w-xs" disabled={pending} onClick={() => read(o.id)}>
                Prebrano
              </BigButton>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
