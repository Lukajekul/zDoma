// zDoma service worker (T-39): shows the daily reminder and opens the app on tap.
// T-89: when a page can't load (no signal), shows the cached "Ni povezave" page.
// Nothing else is cached: patient data always comes fresh from the server.

const CACHE = "zdoma-offline-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  // Cloudflare redirects /offline.html to /offline. A redirected response can't answer a
  // page load, so store a fresh copy of the body under OFFLINE_URL.
  event.waitUntil(
    (async () => {
      const res = await fetch(OFFLINE_URL, { cache: "reload" });
      const page = new Response(await res.blob(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
      await (await caches.open(CACHE)).put(OFFLINE_URL, page);
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

// Page loads only; every other request goes straight to the network as before.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    (async () => {
      try {
        return (await event.preloadResponse) || (await fetch(event.request));
      } catch {
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })(),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "zDoma", body: "Čas je za današnji pregled.", url: "/patient" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {
    // Keep the default text.
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      lang: "sl",
      tag: "zdoma-opomnik",
      renotify: true,
      data: { url: data.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/patient", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => w.url.startsWith(self.location.origin));
      if (open) return open.navigate(url).then((w) => (w || open).focus());
      return self.clients.openWindow(url);
    }),
  );
});
