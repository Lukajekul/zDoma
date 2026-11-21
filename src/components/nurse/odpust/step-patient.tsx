"use client";

import { useState, useTransition } from "react";
import { BigButton } from "@/components/shell";
import { lookupPatient, type PatientLookup } from "@/app/nurse/odpust/actions";
import { ErrorText, Field } from "./ui";

export type PatientState = {
  davcna: string;
  found: Exclude<PatientLookup, { error: string }> | null;
  firstName: string;
  lastName: string;
  address: string;
  obcina: string;
  naselje: string;
};

type Props = { value: PatientState; onChange: (v: PatientState) => void; onNext: () => void };

/** Step 1: davčna številka → existing patient (reused) or name + address for a new one. */
export function StepPatient({ value: v, onChange, onNext }: Props) {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const set = (patch: Partial<PatientState>) => onChange({ ...v, ...patch });

  function find() {
    setError(undefined);
    start(async () => {
      const res = await lookupPatient(v.davcna);
      if ("error" in res) return setError(res.error);
      onChange({ ...v, found: res, firstName: res.firstName, lastName: res.lastName, address: res.address, obcina: res.obcina, naselje: res.naselje });
    });
  }

  if (!v.found) {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Davčna številka pacienta" inputMode="numeric" value={v.davcna} onChange={(davcna) => set({ davcna })} hint="8 številk" />
        <ErrorText>{error}</ErrorText>
        <BigButton onClick={find} disabled={pending}>{pending ? "Iščem …" : "Naprej"}</BigButton>
      </div>
    );
  }

  const ready = v.firstName.trim() && v.lastName.trim() && v.obcina.trim();
  return (
    <div className="flex flex-col gap-4">
      {v.found.exists ? (
        <p className="rounded-xl bg-status-zeleno-bg p-4 text-xl font-semibold text-status-zeleno">
          Pacient že ima račun: {v.found.firstName} {v.found.lastName} ✓ Nova rehabilitacija se mu bo pojavila v aplikaciji.
        </p>
      ) : (
        <>
          <p className="rounded-xl bg-muted p-4 text-xl">Nov pacient. Ob koncu natisnete prijavni listek s kodo QR.</p>
          <Field label="Ime" value={v.firstName} onChange={(firstName) => set({ firstName })} />
          <Field label="Priimek" value={v.lastName} onChange={(lastName) => set({ lastName })} />
        </>
      )}
      {v.found.hasActiveRehab && (
        <p className="rounded-xl border-2 border-status-rumeno bg-status-rumeno-bg p-4 text-lg text-status-rumeno">
          Pacient že ima odprto rehabilitacijo. Novo odprite samo, če gre za drugo okrevanje.
        </p>
      )}
      <Field label="Občina" value={v.obcina} onChange={(obcina) => set({ obcina })} hint="Po njej predlagamo patronažno sestro." />
      <Field label="Naselje" value={v.naselje} onChange={(naselje) => set({ naselje })} />
      <Field label="Naslov" value={v.address} onChange={(address) => set({ address })} />
      <BigButton onClick={onNext} disabled={!ready}>Naprej</BigButton>
      <BigButton variant="secondary" onClick={() => set({ found: null })}>Druga davčna številka</BigButton>
    </div>
  );
}
