"use client";

import { useState, useTransition } from "react";
import { dodeliVse } from "@/app/nurse/studenti/actions";
import { BigButton } from "@/components/shell";
import type { Proposal } from "@/lib/student/razporedi";

/** "Predlagaj razporeditev": the nurse checks the pairs, removes any, then "Potrdi vse". */
export function ProposalPanel({ initial, nameOf, onClose }: {
  initial: Proposal[];
  nameOf: { patient: (rehabId: string) => string; student: (id: string) => string };
  onClose: () => void;
}) {
  const [pairs, setPairs] = useState(initial);
  const [result, setResult] = useState<{ done: number; failed: number } | null>(null);
  const [pending, start] = useTransition();

  if (result) {
    return (
      <section role="status" className="flex flex-col gap-3 rounded-3xl bg-status-zeleno-bg p-4 text-status-zeleno">
        <p className="text-xl font-bold">Poslano ✓ {result.done} {result.done === 1 ? "prošnja" : "prošenj"} pacientom v potrditev.</p>
        {result.failed > 0 && <p className="text-lg text-status-rdece">{result.failed} ni uspelo. Poskusite jih dodeliti posamezno.</p>}
        <BigButton variant="secondary" onClick={onClose}>V redu</BigButton>
      </section>
    );
  }

  return (
    <section aria-labelledby="predlog" className="flex flex-col gap-3 rounded-3xl border-2 border-primary bg-card p-4 shadow-lift">
      <h2 id="predlog" className="text-xl font-bold">Predlog razporeditve</h2>
      {pairs.length === 0 ? (
        <p className="text-lg">Ni predlogov: pacienti brez študenta nimajo študenta s prostim mestom na svojem območju.</p>
      ) : (
        <>
          <p className="text-lg">Najprej pacienti z največ potrebe, vsak k študentu z istega območja. Rdeči pacienti niso vključeni.</p>
          <ul className="flex flex-col gap-2">
            {pairs.map((p) => (
              <li key={p.rehabId} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-muted px-3 py-2">
                <span className="text-lg"><strong>{nameOf.patient(p.rehabId)}</strong> → {nameOf.student(p.studentId)}</span>
                <button type="button" onClick={() => setPairs(pairs.filter((x) => x !== p))}
                  className="min-h-12 rounded-xl px-3 text-lg font-semibold text-primary underline underline-offset-4 hover:bg-card">
                  Odstrani
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {pairs.length > 0 && (
          <BigButton disabled={pending} onClick={() => start(async () => setResult(await dodeliVse(pairs)))}>
            {pending ? "Pošiljam …" : `Potrdi vse (${pairs.length})`}
          </BigButton>
        )}
        <BigButton variant="secondary" disabled={pending} onClick={onClose}>Prekliči</BigButton>
      </div>
    </section>
  );
}
