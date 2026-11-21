"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { BigButton } from "@/components/shell";
import { newQrCode } from "@/app/prijava/qr-actions";
import type { Uuid } from "@/lib/types";

/**
 * "Nova koda QR" with a confirm step. For staff (patient detail, T-21) and the
 * patient's own settings. Hidden from a zadolženec by the caller; the server checks too.
 */
export function NewQrButton({ patientId }: { patientId: Uuid }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <BigButton variant="secondary" icon={<RefreshCw />} onClick={() => setConfirming(true)}>
        Nova koda QR
      </BigButton>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-3xl bg-card border-2 border-status-rumeno p-4">
      <p className="text-xl font-semibold">Naredim novo kodo QR?</p>
      <p className="text-lg">
        Stara koda in stari listek bosta takoj prenehala delovati. Pacient bo odjavljen na vseh telefonih in se
        mora prijaviti z novim listkom.
      </p>
      {error && (
        <p role="alert" className="text-lg font-semibold">
          {error}
        </p>
      )}
      <BigButton
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await newQrCode(patientId);
            if (result?.error) setError(result.error);
          })
        }
      >
        {pending ? "Delam novo kodo …" : "Da, naredi novo kodo"}
      </BigButton>
      <BigButton variant="secondary" disabled={pending} onClick={() => setConfirming(false)}>
        Prekliči
      </BigButton>
    </div>
  );
}
