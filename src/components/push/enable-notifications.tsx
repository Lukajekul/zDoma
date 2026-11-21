"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { BigButton } from "@/components/shell";
import { saveSubscription, sendTestPush } from "@/app/patient/opomnik/actions";

type State = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

const box = "rounded-xl border-2 p-4 text-lg";

function vapidKey(): Uint8Array<ArrayBuffer> {
  const b64 = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
  const s = atob((b64 + "=".repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

function isIosBrowserTab(): boolean {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia("(display-mode: standalone)").matches || "standalone" in navigator && (navigator as { standalone?: boolean }).standalone;
  return ios && !standalone;
}

/**
 * Turns on the daily reminder on this device (T-39). Used on "Opomnik" and at
 * the first home visit (T-36). There is no "off": the reminder is part of the plan.
 */
export function EnableNotifications() {
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string>();
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      if (isIosBrowserTab()) return setState("ios-install");
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      if (Notification.permission === "denied") return setState("denied");
      if (sub && Notification.permission === "granted") {
        await saveSubscription(sub.toJSON() as never); // keep the server copy current
        return setState("on");
      }
      setState("off");
    })().catch(() => setState("unsupported"));
  }, []);

  const enable = () =>
    start(async () => {
      setMessage(undefined);
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
        const reg = await navigator.serviceWorker.ready;
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey() }));
        const { ok } = await saveSubscription(sub.toJSON() as never);
        if (ok) return setState("on");
      } catch {
        // e.g. private/incognito window, or the push service is unreachable.
      }
      setMessage("Obvestil ni bilo mogoče vklopiti. Če ste v zasebnem oknu, odprite zDoma v navadnem oknu, ali poskusite znova.");
    });

  const test = () =>
    start(async () => {
      const { reached } = await sendTestPush();
      setMessage(reached > 0 ? "Poslano ✓ Obvestilo bo prišlo v nekaj sekundah." : "Obvestila ni bilo mogoče poslati. Poskusite znova.");
    });

  if (state === "loading") return <p className="text-lg">Preverjam obvestila …</p>;
  if (state === "unsupported")
    return <p className={`${box} border-border`}>Ta brskalnik ne podpira obvestil. Opomnik boste videli, ko odprete zDoma.</p>;
  if (state === "ios-install")
    return (
      <div className={`${box} border-status-rumeno bg-status-rumeno-bg text-status-rumeno`}>
        <p className="font-bold">Na iPhonu najprej dodajte zDoma na začetni zaslon:</p>
        <ol className="mt-2 list-decimal pl-6">
          <li>Spodaj tapnite »Deli«.</li>
          <li>Izberite »Dodaj na začetni zaslon«.</li>
          <li>Odprite zDoma z nove ikone in tukaj vklopite obvestila.</li>
        </ol>
      </div>
    );
  if (state === "denied")
    return (
      <p className={`${box} border-status-rumeno bg-status-rumeno-bg text-status-rumeno`}>
        Obvestila so v brskalniku izklopljena. V nastavitvah telefona dovolite obvestila za zDoma ali pokličite patronažno
        sestro.
      </p>
    );

  return (
    <div className="flex flex-col gap-3">
      {state === "on" ? (
        <p className={`${box} border-status-zeleno bg-status-zeleno/10 font-semibold`}>Obvestila so vklopljena ✓</p>
      ) : (
        <BigButton icon={<Bell />} onClick={enable} disabled={pending}>
          {pending ? "Vklapljam …" : "Vklopi obvestila"}
        </BigButton>
      )}
      {state === "on" && (
        <BigButton variant="secondary" icon={<BellRing />} onClick={test} disabled={pending}>
          Pošlji poskusno obvestilo
        </BigButton>
      )}
      {message && (
        <p role="status" className="text-lg font-semibold">
          {message}
        </p>
      )}
    </div>
  );
}
