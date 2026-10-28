// Service Worker for the Meteo PWA
const CACHE_NAME = "meteo-v0.1.0-pre-88dc43bc1e8b8cdf";

const PRECACHE_ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/style.css",
  "js/app.js",
  "js/changelog.js",
  "js/config-view.js",
  "js/dom.js",
  "js/forecast-view.js",
  "js/forecast.js",
  "js/geolocation.js",
  "js/i18n.js",
  "js/icons.js",
  "js/params.js",
  "js/preferences.js",
  "js/pwa.js",
  "js/screens.js",
  "js/theme.js",
  "js/weather-api.js",
  "data/strings.en.json",
  "data/strings.nl.json",
  "CHANGELOG.md",
  "CHANGELOG.nl.md",
  "favicon.ico",
  "assets/favicon.svg",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png",
  "assets/icons/icon-maskable-192.png",
  "assets/icons/icon-maskable-512.png",
  "assets/icons/apple-touch-icon.png",
];

/**
 * Install: precache all core application assets.
 *
 * @param {ExtendableEvent} event - Install event whose lifetime covers the precaching.
 * @returns {void}
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(
        PRECACHE_ASSETS.map((asset) => new Request(asset, { cache: "reload" }))
      ))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate: purge any obsolete caches and claim existing clients.
 *
 * @param {ExtendableEvent} event - Activate event whose lifetime covers the cleanup.
 * @returns {void}
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("meteo-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch: serve cached assets offline with cache-first and runtime fallback.
 *
 * Non-GET and cross-origin requests are left to the browser. Navigations go to the
 * network first and fall back to the cached page, while other assets are served from
 * the cache first and added to it after a successful same-origin response.
 *
 * @param {FetchEvent} event - Fetch event for the intercepted request.
 * @returns {void}
 */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Ignore cross-origin API calls (such as the Open-Meteo forecast and geocoding APIs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // For navigation requests: try network first, fallback to cached index.html
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-cache" })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("index.html")) || cache.match("./");
        })
    );
    return;
  }

  // For static assets: cache-first with network fallback and dynamic caching
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
