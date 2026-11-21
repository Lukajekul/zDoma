"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft } from "lucide-react";
import type { Predloga, Zdravilo } from "@/lib/templates";
import type { Nadomescanje } from "@/lib/types";
import { openRehab } from "@/app/nurse/odpust/actions";
import {
  defaultEndDate, defaultQuestions, defaultValues, mergeMedicines, suggestNurse, type MedLine, type NurseOption,
} from "@/app/nurse/odpust/_lib/plan";
import { StepPatient, type PatientState } from "./step-patient";
import { StepTemplate, StepValues } from "./step-plan";
import { StepMedicines } from "./step-medicines";
import { StepConfirm, StepExercises, StepNurse } from "./step-rest";
import { ErrorText, StepTitle } from "./ui";

const TITLES = ["Pacient", "Skupina pacientov", "Vrednosti in vprašanja", "Zdravila", "Vaje in trajanje", "Patronažna sestra", "Potrditev"];

type Props = { today: string; nurses: NurseOption[]; subs: Pick<Nadomescanje, "nurse_id" | "substitute_id" | "until_date">[]; catalogue: Zdravilo[]; /** Templates with staff defaults applied (T-24). */ templates: Predloga[] };

/** Opening a rehabilitacija at discharge, one step per screen (T-21). */
export function DischargeWizard({ today, nurses, subs, catalogue, templates }: Props) {
  const [step, setStep] = useState(0);
  const [patient, setPatient] = useState<PatientState>({ davcna: "", found: null, firstName: "", lastName: "", address: "", obcina: "", naselje: "" });
  const [templateId, setTemplateId] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<string[]>([]);
  const [meds, setMeds] = useState<MedLine[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [end, setEnd] = useState("");
  const [nurseId, setNurseId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [saving, start] = useTransition();

  const predloga = templates.find((t) => t.id === templateId);
  const suggestion = useMemo(() => suggestNurse(patient.obcina, patient.naselje, nurses, subs, today), [patient.obcina, patient.naselje, nurses, subs, today]);
  const next = () => setStep((s) => s + 1);

  function pickTemplate(id: string) {
    const p = templates.find((t) => t.id === id);
    if (!p) return;
    setTemplateId(id);
    setValues(defaultValues(p));
    setQuestions(defaultQuestions(p));
    setMeds(mergeMedicines(p, patient.found?.previous ?? []));
    setExercises(p.vaje.filter((v) => v.privzetoIzbrano !== false).map((v) => v.id));
    setEnd(defaultEndDate(p, today));
    next();
  }

  function goToNurse() {
    setNurseId(suggestion?.nurse.id ?? null);
    next();
  }

  function confirm() {
    if (!predloga) return;
    setError(undefined);
    start(async () => {
      const res = await openRehab({
        davcna: patient.davcna, firstName: patient.firstName, lastName: patient.lastName,
        address: patient.address, obcina: patient.obcina, naselje: patient.naselje,
        templateId, values, questions, meds, startDate: today, endDate: end, nurseId,
        exercises: predloga.vaje.filter((v) => exercises.includes(v.id)).map((v) => ({ id: v.id, title: v.naslov, repetitions: v.ponovitve })),
      });
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <StepTitle n={step + 1} total={TITLES.length}>{TITLES[step]}</StepTitle>

      {step === 0 && <StepPatient value={patient} onChange={setPatient} onNext={next} />}
      {step === 1 && <StepTemplate templates={templates} value={templateId} onPick={pickTemplate} />}
      {step === 2 && predloga && (
        <StepValues predloga={predloga} values={values} questions={questions} onValues={setValues} onQuestions={setQuestions} onNext={next} />
      )}
      {step === 3 && predloga && <StepMedicines lines={meds} catalogue={catalogue} note={predloga.zdravilaOpomba} onChange={setMeds} onNext={next} />}
      {step === 4 && predloga && (
        <StepExercises predloga={predloga} exercises={exercises} start={today} end={end} onExercises={setExercises} onEnd={setEnd} onNext={goToNurse} />
      )}
      {step === 5 && <StepNurse suggestion={suggestion} nurses={nurses} nurseId={nurseId} onPick={setNurseId} onNext={next} />}
      {step === 6 && predloga && (
        <>
          <StepConfirm
            name={`${patient.firstName} ${patient.lastName}`}
            isNew={!patient.found?.exists}
            predloga={predloga}
            questions={questions.length}
            meds={meds}
            exercises={exercises.length}
            start={today}
            end={end}
            nurse={nurses.find((n) => n.id === nurseId)?.name ?? "Nedodeljeni"}
            saving={saving}
            onConfirm={confirm}
          />
          <ErrorText>{error}</ErrorText>
        </>
      )}

      {step > 0 && !saving && (
        <button type="button" onClick={() => setStep(step - 1)} className="inline-flex min-h-12 w-fit items-center gap-2 rounded-lg border-2 border-border px-4 text-lg font-semibold hover:bg-muted">
          <ArrowLeft aria-hidden className="size-6" /> Prejšnji korak
        </button>
      )}
    </div>
  );
}
