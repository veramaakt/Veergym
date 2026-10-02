// Service worker: bewaart de app op je telefoon, zodat hij zonder bereik opent.
// Verhoog VERSION na een update, dan haalt de app de nieuwe bestanden op.
const VERSION = "veergym-v11";
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
  "app/food.js",
  "app/foodai.js",
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
  "app/screens/food.js",
  "app/screens/foodweek.js",
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
// Staat je Mac uit, dan mislukt een verzoek via Tailscale niet meteen maar blijft het hangen.
// Daarom: na 2,5 seconden zonder antwoord de bewaarde versie, en de halve minuut daarna
// meteen uit de cache (anders wacht elk bestand opnieuw).
const TIMEOUT = 2500;
let offlineUntil = 0;

function fromCache(request) {
  return caches.match(request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"));
}

function fromNetwork(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), TIMEOUT);
    fetch(request).then((res) => { clearTimeout(timer); resolve(res); }, (err) => { clearTimeout(timer); reject(err); });
  });
}

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin || url.pathname.includes("/api/")) return;
  if (Date.now() < offlineUntil) {
    e.respondWith(fromCache(e.request).then((r) => r || fetch(e.request)));
    return;
  }
  e.respondWith(
    fromNetwork(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => {
        offlineUntil = Date.now() + 30000;
        return fromCache(e.request);
      })
  );
});
