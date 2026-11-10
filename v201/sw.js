/* AquaLife v201 trial — network-first helper.
   Job: a fresh copy wins every time the network answers, so this app can
   never serve a stale build from its own shelf. The cache is only an
   offline fallback. Scope: this folder (/aqualife/v201/) only. */
const CACHE = "aqualife-v201-h104";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("aqualife-v201-") && k !== CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    (async () => {
      try {
        const fresh = await fetch(req);
        const copy = fresh.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return fresh;
      } catch (err) {
        const hit = await caches.match(req);
        if (hit) return hit;
        throw err;
      }
    })()
  );
});
