# Icon Migration Verification

## Walkthrough & Validation
Command: `npm run test:browser`. Exit code: 0. Final output excerpt:

```text
ok - hovering badge 6 shows the sky explanation
ok - the sky tooltip shows the nine weather icons
ok - leaving the sample hides the tooltip and highlights
ok - no guide hover console, page or network errors
ok - a touch phone shows no hover tooltip or highlight in the guide
ok - no touch guide console, page or network errors
```

Command: `python -m unittest discover -s tests -k TestDevopsAdapter`. Exit code: 0.

```text
...................
----------------------------------------------------------------------
Ran 19 tests in 0.260s

OK
```

Command: `python -m unittest discover -s tests -k TestDevopsCli`. Exit code: 0.

```text
....
----------------------------------------------------------------------
Ran 4 tests in 3.661s

OK
```

Full `python -m unittest discover -s tests` was interrupted, exit code 1, after recursively spawning release-test clones.
PID 77068 and its observed descendants were stopped using `processes kill --yes --force`.
This unrelated release integration suite did not complete; no passing result is claimed.
Process inspection confirmed no remaining descendants from that run.
Browser session 78227, node PID 31756, completed and closed its server and browsers.
Capture sessions 15628 and 91883 completed and closed their servers and browsers.
Capture command: `node tests/switch-proof.mjs --out {{companion}}/proof/{{phase}}` with before and after phases.

Command: `npx vitest run tests/icons.test.js (before migration)`. Exit code: 1.

```text

 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0035-move-the-icons-to-the-vendored-external-icon

 ❯ tests/icons.test.js (24 tests | 24 failed) 90ms
   × resolves weather-clear-day to unchanged external geometry 23ms
   × resolves weather-clear-night to unchanged external geometry 3ms
   × resolves weather-partly-day to unchanged external geometry 3ms
   × resolves weather-partly-night to unchanged external geometry 2ms
   × resolves weather-cloudy to unchanged external geometry 2ms
   × resolves weather-fog to unchanged external geometry 1ms
   × resolves weather-rain to unchanged external geometry 1ms
   × resolves weather-snow to unchanged external geometry 1ms
   × resolves weather-thunder to unchanged external geometry 3ms
   × resolves wind-arrow to unchanged external geometry 2ms
   × resolves close to unchanged external geometry 3ms
   × resolves locate to unchanged external geometry 2ms
   × resolves search to unchanged external geometry 1ms
   × resolves externalLink to unchanged external geometry 3ms
   × resolves help to unchanged external geometry 1ms
   × resolves settings to unchanged external geometry 1ms
   × resolves install to unchanged external geometry 2ms
   × resolves wifi to unchanged external geometry 1ms
   × resolves coffee to unchanged external geometry 1ms
   × resolves creditcard to unchanged external geometry 3ms
   × resolves paypal to unchanged external geometry 1ms
   × resolves github to unchanged external geometry 1ms
   × preserves options and rejects unknown names 7ms
   × precaches both sprite files 17ms

⎯⎯⎯⎯⎯⎯ Failed Tests 24 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/icons.test.js > resolves weather-clear-day to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-clear-night to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-partly-day to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-partly-night to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-cloudy to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-fog to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-rain to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-snow to unchanged external geometry
 FAIL  tests/icons.test.js > resolves weather-thunder to unchanged external geometry
```

```text
 FAIL  tests/icons.test.js > resolves wind-arrow to unchanged external geometry
 FAIL  tests/icons.test.js > resolves close to unchanged external geometry
 FAIL  tests/icons.test.js > resolves locate to unchanged external geometry
 FAIL  tests/icons.test.js > resolves search to unchanged external geometry
 FAIL  tests/icons.test.js > resolves externalLink to unchanged external geometry
 FAIL  tests/icons.test.js > resolves help to unchanged external geometry
 FAIL  tests/icons.test.js > resolves settings to unchanged external geometry
 FAIL  tests/icons.test.js > resolves install to unchanged external geometry
 FAIL  tests/icons.test.js > resolves wifi to unchanged external geometry
 FAIL  tests/icons.test.js > resolves coffee to unchanged external geometry
 FAIL  tests/icons.test.js > resolves creditcard to unchanged external geometry
 FAIL  tests/icons.test.js > resolves paypal to unchanged external geometry
 FAIL  tests/icons.test.js > resolves github to unchanged external geometry
AssertionError: expected null not to be null
 ❯ tests/icons.test.js:10:19
      8|   const svg = createIcon(name);
      9|   const use = svg.querySelector("use");
     10|   expect(use).not.toBeNull();
       |                   ^
     11|   expect(svg.querySelector("path, circle, line, rect, polyline")).toBe…
     12|   const [file, id] = use.getAttribute("href").split("#");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/24]⎯

 FAIL  tests/icons.test.js > preserves options and rejects unknown names
AssertionError: expected SVGSVGElement{ …(48) } to be null

- Expected:
null

+ Received:
<svg
  aria-hidden="true"
  class="icon icon-toString"
  fill="none"
  height="16"
  stroke="currentColor"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2.2"
```

```text
  viewBox="0 0 24 24"
  width="16"
>
  function toString() { [native code] }
</svg>

 ❯ tests/icons.test.js:30:34
     28|   expect(svg.getAttribute("aria-label")).toBe("Find");
     29|   expect(createIcon("unknown")).toBeNull();
     30|   expect(createIcon("toString")).toBeNull();
       |                                  ^
     31| });
     32|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/24]⎯

 FAIL  tests/icons.test.js > precaches both sprite files
AssertionError: expected '// Service Worker for the Meteo PWA\r…' to contain '"assets/icons.svg"'

- Expected
+ Received

- "assets/icons.svg"
+ // Service Worker for the Meteo PWA
+ const CACHE_NAME = "meteo-v1.3.0-pre-24b6ba06eccf8e80";
+ 
+ const PRECACHE_ASSETS = [
+   "./",
+   "index.html",
+   "manifest.webmanifest",
+   "css/style.css",
+   "vendor/design/css/base.css",
+   "vendor/design/css/reset.css",
+   "vendor/design/css/shell.css",
+   "vendor/design/looks/bright/primitives.css",
+   "vendor/design/looks/bright/look.css",
+   "css/tokens.css",
+   "js/app.js",
+   "js/changelog.js",
+   "js/config-view.js",
```

```text
+   "js/dom.js",
+   "js/forecast-view.js",
+   "js/forecast.js",
+   "js/geolocation.js",
+   "js/guide-sample.js",
+   "js/guide.js",
+   "js/i18n.js",
+   "js/icons.js",
+   "js/params.js",
+   "js/preferences.js",
+   "js/pwa.js",
+   "js/screens.js",
+   "js/theme.js",
+   "js/units.js",
+   "js/weather-api.js",
+   "data/strings.en.json",
+   "data/strings.nl.json",
+   "CHANGELOG.md",
+   "CHANGELOG.nl.md",
+   "favicon.ico",
+   "assets/favicon.svg",
+   "assets/icons/icon-192.png",
+   "assets/icons/icon-512.png",
+   "assets/icons/icon-maskable-192.png",
+   "assets/icons/icon-maskable-512.png",
+   "assets/icons/apple-touch-icon.png",
+ ];
+ 
+ /**
+  * Install: precache all core application assets.
+  *
+  * @param {ExtendableEvent} event - Install event whose lifetime covers the precaching.
+  * @returns {void}
+  */
+ self.addEventListener("install", (event) => {
+   event.waitUntil(
+     caches
+       .open(CACHE_NAME)
+       .then((cache) => cache.addAll(
+         PRECACHE_ASSETS.map((asset) => new Request(asset, { cache: "reload" }))
```

```text
+       ))
+       .then(() => self.skipWaiting())
+   );
+ });
+ 
+ /**
+  * Activate: purge any obsolete caches and claim existing clients.
+  *
+  * @param {ExtendableEvent} event - Activate event whose lifetime covers the cleanup.
+  * @returns {void}
+  */
+ self.addEventListener("activate", (event) => {
+   event.waitUntil(
+     caches
+       .keys()
+       .then((cacheNames) => {
+         return Promise.all(
+           cacheNames
+             .filter((name) => name.startsWith("meteo-") && name !== CACHE_NAME)
+             .map((name) => caches.delete(name))
+         );
+       })
+       .then(() => self.clients.claim())
+   );
+ });
+ 
+ /**
+  * Fetch: serve cached assets offline with cache-first and runtime fallback.
+  *
+  * Non-GET and cross-origin requests are left to the browser. Navigations go to the
+  * network first and fall back to the cached page, while other assets are served from
+  * the cache first and added to it after a successful same-origin response.
+  *
+  * @param {FetchEvent} event - Fetch event for the intercepted request.
+  * @returns {void}
+  */
+ self.addEventListener("fetch", (event) => {
+   const request = event.request;
+ 
+   // Only handle GET requests
```

```text
+   if (request.method !== "GET") {
+     return;
+   }
+ 
+   const url = new URL(request.url);
+ 
+   // Ignore cross-origin API calls (such as the Open-Meteo forecast and geocoding APIs)
+   if (url.origin !== self.location.origin) {
+     return;
+   }
+ 
+   // For navigation requests: try network first, fallback to cached index.html
+   if (request.mode === "navigate") {
+     event.respondWith(
+       fetch(request, { cache: "no-cache" })
+         .catch(async () => {
+           const cache = await caches.open(CACHE_NAME);
+           return (await cache.match("index.html")) || cache.match("./");
+         })
+     );
+     return;
+   }
+ 
+   // For static assets: cache-first with network fallback and dynamic caching
+   event.respondWith(
+     caches.open(CACHE_NAME).then(async (cache) => {
+       const cachedResponse = await cache.match(request);
+       if (cachedResponse) {
+         return cachedResponse;
+       }
+       return fetch(request).then((networkResponse) => {
+         if (
+           !networkResponse ||
+           networkResponse.status !== 200 ||
+           networkResponse.type !== "basic"
+         ) {
+           return networkResponse;
+         }
+         const responseToCache = networkResponse.clone();
+         caches.open(CACHE_NAME).then((cache) => {
```

```text
+           cache.put(request, responseToCache);
+         });
+         return networkResponse;
+       });
+     })
+   );
+ });
+

 ❯ tests/icons.test.js:35:18
     33| it("precaches both sprite files", () => {
     34|   const worker = readFileSync("sw.js", "utf8");
     35|   expect(worker).toContain('"assets/icons.svg"');
       |                  ^
     36|   expect(worker).toContain('"vendor/design/looks/bright/icons.svg"');
     37| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/24]⎯


 Test Files  1 failed (1)
      Tests  24 failed (24)
   Start at  00:03:14
   Duration  2.89s (environment 88%, transform 5%, tests 4%, import 2%, worker 1%)


```

Command: `npm test`. Exit code: 0.

```text

> meteo@1.3.0-pre test
> vitest run


 RUN  v5.0.5 C:/Dev-Projects/meteo/.plan/work/T0035-move-the-icons-to-the-vendored-external-icon


 Test Files  8 passed (8)
      Tests  198 passed (198)
   Start at  00:05:48
   Duration  2.72s (environment 80%, tests 12%, import 4%, worker 2%, transform 2%)


```

Command: `node vendor/design/bin/check.mjs`. Exit code: 0.

```text
integrity: PASS
conformance: PASS

```

Command: `ruff check scripts/generate-sw.py`. Exit code: 0.

```text
All checks passed!

```

Command: `lint-markdown check CHANGELOG.md docs/specs/visual-style-guide.md`. Exit code: 0.

```text
All 2 markdown files passed linting.

```

Command: `node tests/switch-proof.mjs --compare C:/Dev-Projects/meteo/.plan/tasks/T0035-move-the-icons-to-the-vendored-external-icon/proof/before/styles.json C:/Dev-Projects/meteo/.plan/tasks/T0035-move-the-icons-to-the-vendored-external-icon/proof/after/styles.json`. Exit code: 0.

```text
0 differing selector properties

```

Before and after main-page captures cover 390 and 1440 pixels in both themes.
Icon captures include all 22 original glyphs at 16 and 32 pixels.
Computed snapshots cover pages and representative shared, weather, and filled icons across every accent.
No computed style differences were found. No token names changed.
The changelog addition changes About content deliberately; no icon appearance change is intended.

- [Before phone light icons](proof/before/icons-390-light.png)
- [After phone light icons](proof/after/icons-390-light.png)
- [Before desktop dark icons](proof/before/icons-1440-dark.png)
- [After desktop dark icons](proof/after/icons-1440-dark.png)

