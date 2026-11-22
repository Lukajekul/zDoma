"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { TriangleAlert, X } from "lucide-react";
import { dodeliStudenta } from "@/app/nurse/studenti/actions";
import { BigButton, StatusBadge } from "@/components/shell";
import { formatDate } from "@/lib/format";
import { MAX_PATIENTS_PER_STUDENT, type Need, type RazporediPatient, type Suggestion } from "@/lib/student/razporedi";

/** Bottom sheet for one patient: why they need help, 3 suggested students, one tap "Dodeli". */
export function AssignSheet({ patient, need, suggestions, onClose }: {
  patient: RazporediPatient;
  need: Need;
  suggestions: Suggestion[];
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const assign = (s: Suggestion) =>
    start(async () => {
      setError(null);
      const r = await dodeliStudenta(patient.rehabId, s.student.id);
      if (r.error) setError(r.error);
      else setSent(s.student.name);
    });

  return (
    <div role="dialog" aria-modal="false" aria-labelledby="assign-title"
      className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lift md:inset-x-auto md:right-6 md:bottom-6 md:w-[28rem] md:rounded-3xl md:border">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h2 id="assign-title" className="text-2xl font-bold">{patient.name}</h2>
          <p className="text-lg text-muted-foreground">{patient.naselje ?? patient.obcina ?? "Brez občine"}</p>
        </div>
        <button type="button" onClick={onClose} className="flex min-h-12 items-center gap-1 rounded-xl px-3 text-lg font-semibold hover:bg-muted">
          <X aria-hidden className="size-5" /> Zapri
        </button>
      </div>
      <StatusBadge status={patient.status} short />
      {need.reasons.length > 0 && (
        <ul className="my-3 flex flex-wrap gap-2">
          {need.reasons.map((r) => <li key={r} className="rounded-full bg-muted px-3 py-1 text-base font-semibold">{r}</li>)}
        </ul>
      )}
      {need.nurseFirst && (
        <p className="my-3 flex gap-2 rounded-2xl border-2 border-status-rdece bg-status-rdece-bg p-3 text-lg text-status-rdece">
          <TriangleAlert aria-hidden className="mt-1 size-5 shrink-0" />
          Najprej obisk sestre. Študent ne opravlja zdravstvene nege, lahko pa pomaga poleg.
        </p>
      )}

      {sent ? (
        <p role="status" className="my-4 rounded-2xl bg-status-zeleno-bg p-4 text-xl font-bold text-status-zeleno">
          Poslano ✓ {sent} čaka, da pacient potrdi pomoč.
        </p>
      ) : patient.student ? (
        <p className="my-4 text-lg">
          Študent: <strong>{patient.student.name}</strong> – {patient.student.approved ? "pacient je potrdil ✓" : "čaka na potrditev pacienta"}.{" "}
          <Link href={`/nurse/${patient.rehabId}`} className="font-semibold text-primary underline underline-offset-4">Odstrani na kartici pacienta</Link>
        </p>
      ) : suggestions.length === 0 ? (
        <p className="my-4 text-lg">Noben študent nima prostega mesta (največ {MAX_PATIENTS_PER_STUDENT} pacienti na študenta).</p>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          <h3 className="text-xl font-bold">Predlagani študenti</h3>
          {suggestions.map((s) => (
            <div key={s.student.id} className="rounded-2xl border-2 p-3">
              <p className="text-lg font-bold">{s.student.name}</p>
              <p className="text-base">
                {s.sameArea ? "Isto območje ✓" : "Drugo območje"} · {s.student.load} od {MAX_PATIENTS_PER_STUDENT} pacientov
              </p>
              <p className="text-base text-muted-foreground">
                Praksa do {formatDate(s.student.until)}{s.endsEarly ? " – konča se pred koncem rehabilitacije" : ""}
              </p>
              <BigButton className="mt-2 w-full" disabled={pending} onClick={() => assign(s)}>
                Dodeli
              </BigButton>
            </div>
          ))}
          <p className="text-base text-muted-foreground">Pacient mora pomoč potrditi v aplikaciji.</p>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-lg font-semibold text-status-rdece">{error}</p>}
    </div>
  );
}
