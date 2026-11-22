"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Camera, Plus, RotateCcw, Send, Trash2 } from "lucide-react";
import { MAX_PHOTOS } from "@/app/patient/_lib/photo-paths";
import { BigButton, bigButtonClass } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";
import { downscaleImage } from "./downscale-image";

type Props = { rehabId: string; today: string; onDone: (paths: string[]) => void };

/** A taken photo, kept in the browser until "Pošlji". */
type Shot = { id: string; blob: Blob; preview: string };

/**
 * Up to two wound photos, uploaded to the private `wound-photos` bucket under the rehab id.
 * Nothing is uploaded before "Pošlji", so "Ponovi" and "Odstrani" leave no files behind.
 */
export function PhotoScreen({ rehabId, today, onDone }: Props) {
  const [shots, setShots] = useState<Shot[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  // shot id → storage path, so "Poskusi znova" doesn't upload the same photo twice.
  const uploaded = useRef(new Map<string, string>());
  const previews = useRef(new Set<string>());

  // Free the preview URLs when the screen closes.
  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  async function take(file: File | undefined, replaceId?: string) {
    if (!file) return;
    setError(false);
    const blob = await downscaleImage(file);
    const preview = URL.createObjectURL(blob);
    previews.current.add(preview);
    const shot: Shot = { id: crypto.randomUUID(), blob, preview };
    setShots((prev) =>
      replaceId && prev.some((s) => s.id === replaceId)
        ? prev.map((s) => (s.id === replaceId ? shot : s))
        : [...prev, shot].slice(0, MAX_PHOTOS),
    );
  }

  async function send() {
    setBusy(true);
    setError(false);
    const storage = createClient().storage.from("wound-photos");
    const paths: string[] = [];
    for (const shot of shots) {
      let path = uploaded.current.get(shot.id);
      if (!path) {
        const ext = shot.blob.type === "image/png" ? "png" : "jpg";
        path = `${rehabId}/${today}-${crypto.randomUUID()}.${ext}`;
        const { error } = await storage.upload(path, shot.blob, { contentType: shot.blob.type || "image/jpeg" });
        if (error) {
          setBusy(false);
          return setError(true);
        }
        uploaded.current.set(shot.id, path);
      }
      paths.push(path);
    }
    setSent(true);
    setTimeout(() => onDone(paths), 1200);
  }

  if (sent) {
    return (
      <p role="status" className="rounded-xl bg-status-zeleno-bg p-5 text-2xl font-bold text-status-zeleno">
        {shots.length === 1 ? "Fotografija shranjena ✓" : "Fotografiji shranjeni ✓"}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl">
        {shots.length === 0
          ? "Fotografirajte rano od blizu, pri dobri svetlobi. Sestra jo bo pogledala."
          : "Je fotografija jasna? Če ni, jo ponovite."}
      </p>

      {shots.length > 0 && (
        <ul className="grid grid-cols-2 gap-3">
          {shots.map((s, i) => (
            <li key={s.id} className="flex min-w-0 flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview before upload */}
              <img
                src={s.preview}
                alt={`Fotografija ${i + 1}`}
                className="aspect-square w-full rounded-xl border bg-muted object-cover"
              />
              <CameraInput variant="secondary" disabled={busy} onFile={(f) => take(f, s.id)}>
                <RotateCcw aria-hidden />
                Ponovi
              </CameraInput>
              <BigButton
                variant="secondary"
                icon={<Trash2 />}
                disabled={busy}
                onClick={() => setShots((prev) => prev.filter((x) => x.id !== s.id))}
              >
                Odstrani
              </BigButton>
            </li>
          ))}
        </ul>
      )}

      {shots.length === 0 && (
        <CameraInput variant="primary" disabled={busy} onFile={(f) => take(f)}>
          <Camera aria-hidden />
          Fotografiraj rano
        </CameraInput>
      )}
      {shots.length > 0 && shots.length < MAX_PHOTOS && (
        <CameraInput variant="secondary" disabled={busy} onFile={(f) => take(f)}>
          <Plus aria-hidden />
          Dodaj drugo fotografijo (ni nujno)
        </CameraInput>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-status-rdece-bg p-3 text-lg font-semibold text-status-rdece">
          Fotografije ni bilo mogoče poslati. Preverite internetno povezavo in poskusite znova ali jo preskočite.
        </p>
      )}

      {shots.length > 0 && (
        <BigButton icon={<Send />} disabled={busy} onClick={send}>
          {busy ? "Pošiljam …" : error ? "Poskusi znova" : "Pošlji"}
        </BigButton>
      )}
      <BigButton variant="secondary" disabled={busy} onClick={() => onDone([])}>
        Preskoči fotografijo
      </BigButton>
    </div>
  );
}

/** A big button that opens the back camera (the file picker on a PC). */
function CameraInput({
  variant,
  disabled,
  onFile,
  children,
}: {
  variant: "primary" | "secondary";
  disabled: boolean;
  onFile: (file: File | undefined) => void;
  children: ReactNode;
}) {
  return (
    <label className={bigButtonClass(variant, disabled ? "opacity-50" : "cursor-pointer")}>
      {children}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </label>
  );
}
