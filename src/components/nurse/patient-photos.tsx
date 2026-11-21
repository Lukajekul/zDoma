import Image from "next/image";
import type { PatientDetail } from "@/app/nurse/_lib/patient-detail";
import { formatDate } from "@/lib/format";

export function PatientPhotos({ photos, photosUnavailable }: Pick<PatientDetail, "photos" | "photosUnavailable">) {
  return (
    <section className="space-y-3 rounded-3xl bg-card shadow-soft p-4" aria-labelledby="fotografije">
      <h2 className="text-xl font-bold" id="fotografije">Fotografije rane</h2>
      {photosUnavailable ? <p>Fotografij trenutno ni mogoče naložiti. Osvežite stran.</p> : (
        photos.length === 0 ? <p>Fotografij še ni.</p> : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map(({ date, url }) => {
              const day = formatDate(date);
              return (
                <figure className="min-w-0 space-y-1" key={date}>
                  <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                    {url ? (
                      <Image
                        alt={`Fotografija rane z dne ${day}`}
                        className="object-contain"
                        fill
                        referrerPolicy="no-referrer"
                        sizes="(max-width: 640px) 45vw, 440px"
                        src={url}
                        unoptimized
                      />
                    ) : <p className="p-2">Fotografija ni na voljo.</p>}
                  </div>
                  <figcaption><time dateTime={date}>{day}</time></figcaption>
                  {url && (
                    <a
                      aria-label={`Povečaj fotografijo z dne ${day}`}
                      className="inline-flex min-h-12 items-center font-semibold text-primary underline"
                      href={url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Povečaj
                    </a>
                  )}
                </figure>
              );
            })}
          </div>
        )
      )}
    </section>
  );
}
