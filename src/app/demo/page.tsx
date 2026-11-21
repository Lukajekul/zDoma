import { Suspense } from "react";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { AppShell, BigButton } from "@/components/shell";
import { StartButton } from "./start-button";

export const metadata = { title: "Demo – zDoma" };

/** T-11: judges try zDoma as a patient, on this device or by scanning the QR with a phone. */
export default function DemoPage() {
  return (
    <AppShell title="Preizkusite zDoma" back="/">
      <p className="text-xl">
        Postanite pacient s srčnim popuščanjem, ki je bil pred dvema dnevoma odpuščen iz bolnišnice. Prijava je takšna,
        kot da bi skenirali kodo QR na prijavnem listku.
      </p>
      <StartButton />
      <Suspense fallback={null}>
        <PhoneQr />
      </Suspense>
      <section className="mt-4 flex flex-col gap-3 border-t-2 pt-6">
        <h2 className="text-2xl font-bold">Za sestro</h2>
        <p className="text-lg">Prijavite se kot patronažna sestra z demo računom in poglejte, kdo potrebuje pomoč.</p>
        <BigButton href="/prijava" variant="secondary">
          Prijava za sestro
        </BigButton>
      </section>
    </AppShell>
  );
}

/** QR of this page, so a judge can continue on their own phone. */
async function PhoneQr() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const svg = await QRCode.toString(`${process.env.SITE_URL ?? `${proto}://${host}`}/demo`, {
    type: "svg",
    margin: 2,
  });
  return (
    <figure className="flex flex-col items-center gap-2 rounded-xl border-2 border-border p-4">
      <div
        role="img"
        aria-label="Koda QR za to stran"
        className="w-48 bg-white [&_svg]:h-auto [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <figcaption className="text-center text-lg">Raje na telefonu? Skenirajte kodo s kamero.</figcaption>
    </figure>
  );
}
