"use client";

import { useEffect } from "react";

/**
 * Registers the service worker on every page (T-89), so the installed app shows
 * the "Ni povezave" page when offline. Push reminders reuse the same worker (T-39).
 */
export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
