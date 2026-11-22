import { Phone, TriangleAlert } from "lucide-react";
import { BigButton } from "@/components/shell";
import type { TriageStatus } from "@/lib/types";

export interface StudentWarningProps {
  status: TriageStatus;
  /** Alert reasons a nurse wrote or triage raised, e.g. "Teža +2,5 kg v 3 dneh". */
  reasons: string[];
  nurse: { name: string; phone: string | null } | null;
}

/**
 * Shown to the študent pomočnik when the patient is yellow or red: the student
 * never decides or reassures, they call the nurse. Staff already have the alert.
 */
export function StudentWarning({ status, reasons, nurse }: StudentWarningProps) {
  if (status === "zeleno") return null;
  const red = status === "rdece";
  return (
    <section
      role="alert"
      className={
        red
          ? "flex flex-col gap-3 rounded-3xl border-2 border-status-rdece bg-status-rdece-bg p-5 text-status-rdece"
          : "flex flex-col gap-3 rounded-3xl border-2 border-status-rumeno bg-status-rumeno-bg p-5 text-status-rumeno"
      }
    >
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <TriangleAlert aria-hidden className="size-7 shrink-0" />
        {red ? "Rdeče – potrebna pozornost" : "Rumeno – sestra bo pogledala"}
      </h2>
      {reasons.length > 0 && (
        <ul className="list-disc pl-6 text-lg">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <p className="text-lg text-foreground">
        Sestra je že obveščena. Ne odločajte sami in pacientu ne razlagajte izvidov.
        {red ? " Pokličite sestro zdaj." : " Če ste v dvomih, pokličite sestro."}
      </p>
      {nurse?.phone ? (
        <BigButton href={`tel:${nurse.phone.replace(/\s/g, "")}`} variant={red ? "danger" : "primary"} icon={<Phone />}>
          Pokliči: {nurse.name}
        </BigButton>
      ) : (
        nurse && <p className="text-lg text-foreground">Pokličite sestro {nurse.name} prek ambulante.</p>
      )}
      <p className="text-lg font-semibold text-foreground">
        Bolečina v prsih, huda težka sapa, omedlevica ali znaki kapi: takoj pokličite 112.
      </p>
    </section>
  );
}
