import { getLoginQr, qrAccessFor } from "@/lib/qr/accounts";
import type { Uuid } from "@/lib/types";

/**
 * The patient's login QR, big enough to scan from another phone or paper.
 * Use it for "Pokaži QR za prijavo" (T-09) and "QR za prijavo" (T-20).
 * Server Component that reads cookies: render it inside <Suspense>.
 * Shows nothing secret unless the viewer is staff, the patient or an approved zadolženec.
 */
export async function LoginQr({ patientId, caption = true }: { patientId: Uuid; caption?: boolean }) {
  const who = await qrAccessFor(patientId);
  if (!who) {
    return <p className="text-xl">Te kode QR ne morete videti.</p>;
  }
  const qr = await getLoginQr(patientId);
  if (!qr) {
    return (
      <p className="text-xl">
        Kode QR ni: pacient si je že nastavil svoje geslo (ali kode še nima). Če je geslo pozabil, pritisnite
        »Nova koda QR«.
      </p>
    );
  }
  return (
    <figure className="flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label={`Koda QR za prijavo: ${qr.firstName} ${qr.lastName}`}
        className="w-full max-w-80 bg-white [&_svg]:h-auto [&_svg]:w-full"
        // SVG generated on the server by the qrcode library from our own URL.
        dangerouslySetInnerHTML={{ __html: qr.svg }}
      />
      {caption && (
        <figcaption className="text-center text-xl">
          <strong className="block text-2xl">
            {qr.firstName} {qr.lastName}
          </strong>
          Skenirajte s kamero telefona.
        </figcaption>
      )}
    </figure>
  );
}
