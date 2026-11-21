"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { BigButton, bigButtonClass } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type Props = { rehabId: string; today: string; onDone: (path?: string) => void };

/** Optional wound photo, uploaded to the private `wound-photos` bucket under the rehab id. */
export function PhotoScreen({ rehabId, today, onDone }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    setError(false);
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${rehabId}/${today}-${crypto.randomUUID()}.${ext}`;
    const { error } = await createClient().storage.from("wound-photos").upload(path, file, { contentType: file.type });
    setBusy(false);
    if (error) return setError(true);
    onDone(path);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl">Fotografirajte rano od blizu, pri dobri svetlobi. Sestra jo bo pogledala.</p>
      <label className={bigButtonClass("primary", busy ? "opacity-50" : "cursor-pointer")}>
        <Camera aria-hidden />
        {busy ? "Pošiljam fotografijo …" : "Fotografiraj rano"}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
      </label>
      {error && (
        <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
          Fotografije ni bilo mogoče poslati. Poskusite znova ali jo preskočite.
        </p>
      )}
      <BigButton variant="secondary" disabled={busy} onClick={() => onDone(undefined)}>
        Preskoči fotografijo
      </BigButton>
    </div>
  );
}
