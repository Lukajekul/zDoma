import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Emergency } from "@/app/patient/_lib/checkin-plan";
import { ObservationForm, type ChipView } from "@/components/carer/observation-form";
import { AppShell } from "@/components/shell";
import { predlogaZaRehab, vstaviVrednosti } from "@/lib/templates";
import { type RehabParams, getCarerRehab, patientName } from "../../_lib/access";

export const metadata = { title: "Sporočite opažanje – Skrbim za – zDoma" };

/** T-73: the zadolženec reports something they noticed. Optional, never a daily task. */
export default function CarerObservationPage({ params }: RehabParams) {
  return (
    <Suspense
      fallback={
        <AppShell title="Sporočite opažanje">
          <p className="text-xl">Nalagam …</p>
        </AppShell>
      }
    >
      <Observation params={params} />
    </Suspense>
  );
}

async function Observation({ params }: RehabParams) {
  const { rehabId } = await params;
  const c = await getCarerRehab(rehabId);
  if (!c || c.helper !== "family") notFound();
  const predloga = predlogaZaRehab(c.rehab);
  if (!predloga) notFound();

  const values = c.rehab.patient_values;
  const phoneKey = predloga.vrednostiPacienta.find((v) => v.tip === "telefon")?.kljuc;
  const chips: ChipView[] = predloga.opazanja.map((o) => {
    const rule = o.pravilo ? predloga.pravila.find((p) => p.id === o.pravilo) : undefined;
    const urgent = rule?.stopnja === "klic112" || rule?.stopnja === "klicOddelek";
    const emergency: Emergency | undefined = urgent
      ? {
          kind: rule.stopnja as Emergency["kind"],
          reason: vstaviVrednosti(rule.razlog, values),
          phone: phoneKey ? String(values[phoneKey] ?? "") || undefined : undefined,
        }
      : undefined;
    return { id: o.id, text: o.besedilo, alerting: !!rule && rule.stopnja !== "opomba", emergency };
  });

  return (
    <AppShell title="Sporočite opažanje" back={c.base}>
      {c.active ? (
        <ObservationForm rehabId={c.rehab.id} name={patientName(c.patient)} chips={chips} back={c.base} />
      ) : (
        <p className="rounded-3xl bg-card shadow-soft p-4 text-xl">To okrevanje je zaključeno.</p>
      )}
    </AppShell>
  );
}
