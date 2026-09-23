// Service worker: bewaart de app op je telefoon, zodat hij zonder bereik opent.
// Verhoog VERSION na een update, dan haalt de app de nieuwe bestanden op.
const VERSION = "veergym-v7";
const SHELL = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "fonts/PlusJakartaSans.woff2",
  "ds/styles.css",
  "ds/tokens/fonts.css",
  "ds/tokens/colors.css",
  "ds/tokens/typography.css",
  "ds/tokens/spacing.css",
  "ds/tokens/radius.css",
  "ds/tokens/shadows.css",
  "ds/tokens/base.css",
  "ds/ds_bundle.js",
  "vendor/react.production.min.js",
  "vendor/react-dom.production.min.js",
  "vendor/htm.umd.js",
  "vendor/muscle-female.js",
  "app/app.css",
  "app/main.js",
  "app/ui.js",
  "app/store.js",
  "app/sync.js",
  "app/logic.js",
  "app/session.js",
  "app/clipboard.js",
  "app/stats.js",
  "app/muscles.js",
  "app/measure.js",
  "app/demo.js",
  "app/screens/login.js",
  "app/screens/later.js",
  "app/screens/home.js",
  "app/screens/workout.js",
  "app/screens/summary.js",
  "app/screens/template.js",
  "app/screens/library.js",
  "app/screens/exercise.js",
  "app/screens/settings.js",
  "app/screens/progress.js",
  "app/screens/recap.js",
  "app/screens/import.js",
  "app/screens/measure.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// App-bestanden: eerst het netwerk (altijd de nieuwste versie), zonder bereik uit de cache.
// De API gaat nooit via de cache.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
