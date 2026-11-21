import { Suspense } from "react";
import { BackButton } from "@/components/shell";
import { LoginQr } from "@/components/auth/login-qr";
import { NewQrButton } from "@/components/auth/new-qr-button";
import { qrAccessFor } from "@/lib/qr/accounts";
import { PrintButton } from "./print-button";

/**
 * Prijavni listek: name + big QR + "Hranite kot ključ". Printed at discharge
 * (T-21) and after "Nova koda QR". Never part of the odpustnica.
 */
export default function ListekPage({ params }: PageProps<"/prijava/listek/[patientId]">) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 pt-4 pb-10 print:max-w-none print:p-0">
      <header className="flex flex-col items-start gap-4 print:hidden">
        <BackButton />
        <h1 className="text-3xl font-bold">Prijavni listek</h1>
      </header>
      <Suspense fallback={<p className="text-xl">Nalagam …</p>}>
        <Listek params={params} />
      </Suspense>
    </div>
  );
}

async function Listek({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const who = await qrAccessFor(patientId);

  return (
    <>
      <section className="flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-foreground p-6 text-center print:border-solid">
        <p className="text-2xl font-bold">zDoma – prijavni listek</p>
        <LoginQr patientId={patientId} />
        <p className="text-xl font-semibold">
          Hranite kot ključ. Če ga izgubite, pokličite patronažno sestro.
        </p>
      </section>
      {who && (
        <div className="flex flex-col gap-3 print:hidden">
          <PrintButton />
          {who.access !== "carer" && <NewQrButton patientId={patientId} />}
        </div>
      )}
    </>
  );
}
