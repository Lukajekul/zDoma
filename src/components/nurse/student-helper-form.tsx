"use client";

import { useState, useTransition } from "react";
import { assignStudent, removeStudent } from "@/app/nurse/[rehabId]/student-actions";
import { BigButton } from "@/components/shell";
import { formatDate } from "@/lib/format";

type Props = {
  rehabId: string;
  active: boolean;
  assigned: { id: string; name: string; approved: boolean; until: string | null } | null;
  /** The patient rejected the last student. */
  lastRejected: boolean;
  students: { id: string; name: string; until: string }[];
};

export function StudentHelperForm({ rehabId, active, assigned, lastRejected, students }: Props) {
  const [studentId, setStudentId] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (action: () => Promise<{ error?: string }>) =>
    start(async () => {
      setError(null);
      const r = await action();
      if (r.error) setError(r.error);
      else {
        setConfirmRemove(false);
        setStudentId("");
      }
    });

  if (assigned) {
    return (
      <div className="space-y-3">
        <p className="text-lg">
          <strong>{assigned.name}</strong>
          {" – "}
          {assigned.approved ? "pacient je potrdil ✓" : "čaka na potrditev pacienta"}
          {assigned.until && <span className="block text-muted-foreground">Praksa do {formatDate(assigned.until)}</span>}
        </p>
        {confirmRemove ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <BigButton variant="danger" disabled={pending} onClick={() => run(() => removeStudent(rehabId, assigned.id))}>
              Da, odstrani študenta
            </BigButton>
            <BigButton variant="secondary" disabled={pending} onClick={() => setConfirmRemove(false)}>
              Prekliči
            </BigButton>
          </div>
        ) : (
          <BigButton variant="secondary" onClick={() => setConfirmRemove(true)}>
            Odstrani študenta
          </BigButton>
        )}
        {error && <p role="alert" className="font-semibold text-status-rdece">{error}</p>}
      </div>
    );
  }

  if (!active) return <p>Rehabilitacija ni aktivna, zato študenta ne morete dodeliti.</p>;
  if (students.length === 0) return <p>Trenutno ni študentov na praksi.</p>;

  return (
    <div className="space-y-3">
      {lastRejected && <p className="font-semibold">Pacient je zadnjega študenta zavrnil.</p>}
      <label className="block space-y-1">
        <span className="text-lg font-semibold">Izberite študenta</span>
        <select
          className="block min-h-12 w-full rounded-xl border-2 bg-background px-3 text-lg"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          <option value="">– izberite –</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (praksa do {formatDate(s.until)})
            </option>
          ))}
        </select>
      </label>
      <BigButton disabled={!studentId || pending} onClick={() => run(() => assignStudent(rehabId, studentId))}>
        Dodeli študenta
      </BigButton>
      {error && <p role="alert" className="font-semibold text-status-rdece">{error}</p>}
    </div>
  );
}
