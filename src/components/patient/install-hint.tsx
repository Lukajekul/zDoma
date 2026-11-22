"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import { BigButton, Card, IconTile } from "@/components/shell";

/** Chrome/Edge/Samsung fire this when the app can be installed with one tap. */
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

const SNOOZE_KEY = "zdoma-install-hint-snoozed";
const SNOOZE_DAYS = 7;

function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  // iPadOS reports itself as a Mac, so also check for touch.
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
}

function snoozed(): boolean {
  const until = Number(localStorage.getItem(SNOOZE_KEY) ?? 0);
  return Date.now() < until;
}

/**
 * "Dodaj na začetni zaslon" card on "Danes" (T-89). Hidden once zDoma runs from the
 * home screen. Android: one tap through the browser's own prompt. iPhone: the two
 * steps in words, since Safari has no prompt. Elsewhere (PC) it shows nothing.
 */
export function InstallHint() {
  const [mode, setMode] = useState<"hidden" | "prompt" | "ios" | "done">("hidden");
  const [prompt, setPrompt] = useState<InstallPromptEvent>();

  useEffect(() => {
    if (isInstalled() || snoozed()) return;
    // Client-only checks: decided after mount so server and client render the same.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIos()) return setMode("ios");
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
      setMode("prompt");
    };
    const onInstalled = () => setMode("done");
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (mode === "hidden") return null;
  if (mode === "done")
    return (
      <Card className="flex-row items-center">
        <IconTile><Smartphone /></IconTile>
        <p role="status" className="text-xl font-semibold">Dodano na začetni zaslon ✓</p>
      </Card>
    );

  const snooze = () => {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000));
    setMode("hidden");
  };
  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(undefined);
    setMode(outcome === "accepted" ? "done" : "hidden");
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <IconTile><Smartphone /></IconTile>
        <h2 className="text-2xl leading-tight font-bold">Dodajte zDoma na začetni zaslon</h2>
      </div>
      <p className="text-lg">Tako zDoma odprete z eno ikono, kot vsako drugo aplikacijo, in prejmete dnevni opomnik.</p>
      {mode === "ios" ? (
        <ol className="list-decimal pl-6 text-lg">
          <li>Spodaj tapnite »Deli« (kvadrat s puščico navzgor).</li>
          <li>Izberite »Dodaj na začetni zaslon«.</li>
          <li>Tapnite »Dodaj«.</li>
        </ol>
      ) : (
        <BigButton icon={<Smartphone />} onClick={install}>Dodaj na začetni zaslon</BigButton>
      )}
      <BigButton variant="secondary" onClick={snooze}>Ne zdaj</BigButton>
    </Card>
  );
}
