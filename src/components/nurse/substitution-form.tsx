"use client";

import { useState, useTransition } from "react";
import { BigButton } from "@/components/shell";

type Nurse = { id: string; name: string };
type Result = { error?: string; ok?: boolean };

const select = "min-h-12 rounded-lg border-2 border-input bg-background px-3 text-xl";

/** "Nadomeščanje": whose patients, to whom, until when. */
export function SubstitutionForm({ nurses, me, today, onCreate }: {
  nurses: Nurse[];
  me: string;
  today: string;
  onCreate: (nurseId: string, substituteId: string, until: string) => Promise<Result>;
}) {
  const [nurseId, setNurseId] = useState(nurses.some((n) => n.id === me) ? me : "");
  const [substituteId, setSubstituteId] = useState("");
  const [until, setUntil] = useState("");
  const [res, setRes] = useState<Result>({});
  const [pending, start] = useTransition();

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => setRes(await onCreate(nurseId, substituteId, until)));
      }}
    >
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Čigave paciente
        <select className={select} value={nurseId} onChange={(e) => setNurseId(e.target.value)}>
          <option value="">Izberite sestro</option>
          {nurses.map((n) => <option key={n.id} value={n.id}>{n.name}{n.id === me ? " (jaz)" : ""}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Kdo jih prevzame
        <select className={select} value={substituteId} onChange={(e) => setSubstituteId(e.target.value)}>
          <option value="">Izberite sodelavko</option>
          {nurses.filter((n) => n.id !== nurseId).map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-lg font-semibold">
        Do vključno
        <input type="date" min={today} value={until} onChange={(e) => setUntil(e.target.value)} className={select} />
      </label>
      <BigButton type="submit" disabled={pending || !nurseId || !substituteId || !until}>
        {pending ? "Shranjujem …" : "Predaj paciente"}
      </BigButton>
      {res.ok && <p className="rounded-lg bg-status-zeleno-bg p-3 text-lg font-semibold text-status-zeleno">Shranjeno ✓ Pacienti se po tem datumu vrnejo sami.</p>}
      {res.error && <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">{res.error}</p>}
    </form>
  );
}
