import type { PatientDetail } from "@/app/nurse/_lib/patient-detail";
import { AppShell, BigButton, StatusBadge } from "@/components/shell";
import { formatDate } from "@/lib/format";
import { PatientAlerts } from "./patient-alerts";
import { PatientPhotos } from "./patient-photos";
import { PatientTrends } from "./patient-trends";

const percent = new Intl.NumberFormat("sl-SI", { style: "percent" });

export function PatientOverview({ detail, back }: { detail: PatientDetail; back: string }) {
  const { patient } = detail;
  const location = [...new Set([patient.naselje, patient.obcina].filter(Boolean))].join(", ");
  const name = [patient.first_name, patient.last_name].filter(Boolean).join(" ") || "Podrobnosti pacienta";
  const number = patient.phone?.replace(/[^+\d]/g, "") ?? "";
  const callHref = /^\+?\d{3,15}$/.test(number) ? `tel:${number}` : null;

  return (
    <AppShell title={name} back={back} wide>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-2">
          {location && <p>{location}</p>}
          {detail.templateName && <p className="text-xl font-semibold">{detail.templateName}</p>}
          {detail.diagnosis && detail.diagnosis !== detail.templateName && <p>{detail.diagnosis}</p>}
          <p>{formatDate(detail.startDate)} – {formatDate(detail.endDate)}</p>
          {!detail.active && <p className="font-semibold">Rehabilitacija trenutno ni aktivna.</p>}
          <StatusBadge short status={detail.status} />
        </div>
        <div className="grid max-w-md gap-2">
          {callHref ? (
            <a className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-primary px-4 py-2 font-semibold text-primary hover:bg-primary/10" href={callHref}>
              Pokliči pacienta
            </a>
          ) : <p>Telefonska številka za klic ni na voljo.</p>}
          <BigButton href={`/prijava/listek/${detail.patientId}`} variant="secondary">Pokaži QR za prijavo</BigButton>
        </div>
      </div>
      <PatientAlerts active={detail.active} openAlerts={detail.openAlerts} closedAlerts={detail.closedAlerts} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <PatientTrends trends={detail.trends} />
        <section aria-labelledby="povzetek" className="space-y-3 rounded-2xl border p-4">
          <h2 className="text-xl font-bold" id="povzetek">Tedenski povzetek</h2>
          {detail.participation !== null && <p><strong>Sodelovanje</strong> {percent.format(detail.participation)}</p>}
          {detail.lace !== null && <p><strong>LACE</strong> {detail.lace}</p>}
          {detail.summary.length > 0 ? (
            <ul className="list-disc space-y-1 pl-6">
              {detail.summary.map((line, index) => <li key={index}>{line}</li>)}
            </ul>
          ) : <p>Povzetek ni na voljo.</p>}
          <BigButton href={`/nurse/odpust/${detail.rehabId}`} variant="secondary">Upravljaj rehabilitacijo</BigButton>
        </section>
      </div>
      <PatientPhotos photos={detail.photos} photosUnavailable={detail.photosUnavailable} />
    </AppShell>
  );
}
