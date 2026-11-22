"use client";

import { useMemo, useState } from "react";
import { List, Map as MapIcon, Sparkles } from "lucide-react";
import { BigButton, StatusBadge } from "@/components/shell";
import { placeOf } from "@/lib/geo/obcine";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  MAX_PATIENTS_PER_STUDENT, proposeAll, sortByNeed, suggestStudents,
  type Proposal, type RazporediPatient, type RazporediStudent,
} from "@/lib/student/razporedi";
import { AssignSheet } from "./assign-sheet";
import { ProposalPanel } from "./proposal";
import { Zemljevid, type MapPatient, type MapStudent } from "./zemljevid";

type Row = ReturnType<typeof sortByNeed>[number];

/**
 * "Razporedi študente" (T-98): list and map side by side from tablet width up,
 * a "Seznam / Zemljevid" switch on a phone. Tap a patient → suggested students.
 */
export function Razporedi({ patients, students }: { patients: RazporediPatient[]; students: RazporediStudent[] }) {
  const [view, setView] = useState<"seznam" | "zemljevid">("seznam");
  const [selected, setSelected] = useState<string | null>(null);
  const [proposal, setProposal] = useState<Proposal[] | null>(null);

  const rows = useMemo(() => sortByNeed(patients), [patients]);
  const free = rows.filter((r) => !r.student);
  const groups = [
    { title: "Potrebujejo pomoč", rows: free.filter((r) => !r.need.nurseFirst && r.need.score > 0) },
    { title: "Najprej obisk sestre", rows: free.filter((r) => r.need.nurseFirst) },
    { title: "Brez posebne potrebe", rows: free.filter((r) => !r.need.nurseFirst && r.need.score === 0) },
    { title: "Že imajo študenta", rows: rows.filter((r) => r.student) },
  ];
  const withRoom = students.filter((s) => s.load < MAX_PATIENTS_PER_STUDENT).length;
  const current = rows.find((r) => r.rehabId === selected);

  const mapPatients: MapPatient[] = rows.flatMap((r) => {
    const place = placeOf(r.obcina, r.rehabId);
    return place ? [{ rehabId: r.rehabId, name: r.name, status: r.status, place, hasStudent: !!r.student }] : [];
  });
  const mapStudents: MapStudent[] = students.flatMap((s) => {
    const place = placeOf(s.obcine[0] ?? null, s.id);
    return place ? [{ id: s.id, name: s.name, place, load: s.load, max: MAX_PATIENTS_PER_STUDENT }] : [];
  });
  const nameOf = {
    patient: (id: string) => rows.find((r) => r.rehabId === id)?.name ?? "",
    student: (id: string) => students.find((s) => s.id === id)?.name ?? "",
  };

  return (
    <>
      <p className="text-xl">
        <strong>{free.length}</strong> pacientov brez študenta · <strong>{withRoom}</strong> od {students.length} študentov ima prosto mesto
      </p>

      {proposal ? (
        <ProposalPanel initial={proposal} nameOf={nameOf} onClose={() => setProposal(null)} />
      ) : (
        <BigButton icon={<Sparkles aria-hidden className="size-6" />} onClick={() => setProposal(proposeAll(patients, students))}>
          Predlagaj razporeditev
        </BigButton>
      )}

      <div role="group" aria-label="Pogled" className="grid grid-cols-2 gap-2 md:hidden">
        {(["seznam", "zemljevid"] as const).map((v) => (
          <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
            className={cn("flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 text-lg font-bold",
              view === v ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}>
            {v === "seznam" ? <List aria-hidden className="size-5" /> : <MapIcon aria-hidden className="size-5" />}
            {v === "seznam" ? "Seznam" : "Zemljevid"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className={cn("flex flex-col gap-4", view === "zemljevid" && "hidden md:flex")}>
          {groups.map((g) => g.rows.length > 0 && (
            <section key={g.title} className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">{g.title} ({g.rows.length})</h2>
              <ul className="flex flex-col gap-2">
                {g.rows.map((r) => <PatientRow key={r.rehabId} r={r} active={r.rehabId === selected} onSelect={setSelected} />)}
              </ul>
            </section>
          ))}
          <StudentList students={students} />
        </div>
        <div className={cn("h-[65dvh] md:sticky md:top-4 md:h-[calc(100dvh-10rem)]", view === "seznam" && "hidden md:block")}>
          <Zemljevid patients={mapPatients} students={mapStudents} selected={selected} onSelect={setSelected} />
        </div>
      </div>

      {current && (
        <AssignSheet
          key={current.rehabId}
          patient={current}
          need={current.need}
          suggestions={suggestStudents(current, students)}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function PatientRow({ r, active, onSelect }: { r: Row; active: boolean; onSelect: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(r.rehabId)} aria-pressed={active}
        className={cn("flex w-full flex-col gap-1 rounded-3xl bg-card p-4 text-left shadow-soft hover:bg-muted",
          active && "ring-4 ring-primary")}>
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xl font-bold">{r.name}</span>
          <StatusBadge status={r.status} short />
        </span>
        <span className="text-lg text-muted-foreground">{r.naselje ?? r.obcina ?? "Brez občine"}</span>
        {r.student ? (
          <span className="text-lg">Študent: {r.student.name} – {r.student.approved ? "potrjeno ✓" : "čaka na potrditev"}</span>
        ) : r.need.reasons.length > 0 && (
          <span className="text-lg font-semibold">{r.need.reasons.join(" · ")}</span>
        )}
      </button>
    </li>
  );
}

function StudentList({ students }: { students: RazporediStudent[] }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold">Študenti na praksi ({students.length})</h2>
      {students.length === 0 && <p className="rounded-3xl bg-card p-4 text-lg shadow-soft">Trenutno ni študentov na praksi.</p>}
      <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
        {students.map((s) => (
          <li key={s.id} className="rounded-3xl bg-card p-4 shadow-soft">
            <p className="text-xl font-bold">{s.name}</p>
            <p className="text-lg">{s.load} od {MAX_PATIENTS_PER_STUDENT} pacientov{s.load >= MAX_PATIENTS_PER_STUDENT ? " – polno" : ""}</p>
            <p className="text-base text-muted-foreground">
              {s.obcine.length ? s.obcine.join(", ") : "Brez območja"} · praksa do {formatDate(s.until)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
