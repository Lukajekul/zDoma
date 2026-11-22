import Image from "next/image";
import type { PatientDetail } from "@/app/nurse/_lib/patient-detail";
import { formatDate } from "@/lib/format";

/** Latest wound photos, one row per check-in day with up to two photos side by side (T-72). */
export function PatientPhotos({ photos, photosUnavailable }: Pick<PatientDetail, "photos" | "photosUnavailable">) {
  return (
    <section className="space-y-3 rounded-3xl bg-card shadow-soft p-4" aria-labelledby="fotografije">
      <h2 className="text-xl font-bold" id="fotografije">Fotografije rane</h2>
      {photosUnavailable ? <p>Fotografij trenutno ni mogoče naložiti. Osvežite stran.</p> : (
        photos.length === 0 ? <p>Fotografij še ni.</p> : (
          <ul className="space-y-4">
            {photos.map(({ date, urls }) => {
              const day = formatDate(date);
              return (
                <li className="space-y-2" key={date}>
                  <h3 className="font-semibold">
                    <time dateTime={date}>{day}</time>
                    {urls.length > 1 && <span className="font-normal text-muted-foreground"> · {urls.length} fotografiji</span>}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {urls.map((url, i) => (
                      <Photo key={i} url={url} label={`${day}, fotografija ${i + 1}`} />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      )}
    </section>
  );
}

function Photo({ url, label }: { url: string | null; label: string }) {
  return (
    <figure className="min-w-0 space-y-1">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
        {url ? (
          <Image
            alt={`Fotografija rane: ${label}`}
            className="object-contain"
            fill
            referrerPolicy="no-referrer"
            sizes="(max-width: 640px) 45vw, 440px"
            src={url}
            unoptimized
          />
        ) : <p className="p-2">Fotografija ni na voljo.</p>}
      </div>
      {url && (
        <a
          aria-label={`Povečaj fotografijo: ${label}`}
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
}
