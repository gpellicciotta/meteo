#!/usr/bin/env python3
"""Generate service worker (sw.js) with all precached assets.

Cross-platform (Windows/Linux/macOS).

Usage:
  python scripts/generate-sw.py generate
  python scripts/generate-sw.py --version
  python scripts/generate-sw.py --help
"""

from __future__ import annotations

import hashlib
import os
import sys
import time
from pathlib import Path

# Add scripts directory to path to import _cli_common when run directly
SCRIPTS_DIR = Path(__file__).resolve().parent
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from _cli_common import (
    REPO_ROOT,
    TeeLogger,
    build_action_parser,
    get_project_version,
    print_help,
    print_version,
)

PROG = "generate-sw"
DESCRIPTION = "Generates sw.js precaching all core application assets, traffic signs, and situation photos."
ACTIONS = ["generate", "version", "help"]
DEFAULT_ACTION = "generate"
EXIT_CODES = [
    (0, "Success (sw.js generated successfully)"),
    (1, "Asset directories missing or write error"),
]

SIGNS_DIR = REPO_ROOT / "assets" / "signs"
SITUATIONS_DIR = REPO_ROOT / "assets" / "situations"
JS_DIR = REPO_ROOT / "js"
SW_PATH = REPO_ROOT / "sw.js"


def build_sw_content(version: str) -> tuple[str, int]:
    """Generates the full sw.js content with dynamic version cache name and asset paths."""
    signs = sorted([f"assets/signs/{f}" for f in os.listdir(SIGNS_DIR) if f.endswith(".svg")]) if SIGNS_DIR.exists() else []
    situations = sorted([f"assets/situations/{f}" for f in os.listdir(SITUATIONS_DIR) if f.endswith(".jpg")]) if SITUATIONS_DIR.exists() else []
    js_modules = sorted([f"js/{f}" for f in os.listdir(JS_DIR) if f.endswith(".js")]) if JS_DIR.exists() else []
    data_dir = REPO_ROOT / "data"
    data_files = sorted([f"data/{f}" for f in os.listdir(data_dir) if f.endswith(".json") and not f.startswith(".")]) if data_dir.exists() else ["data/questions.json"]
    translated_changelogs = sorted(
        f"CHANGELOG.{lang}.md" for lang in ("en", "fr", "de", "it") if (REPO_ROOT / f"CHANGELOG.{lang}.md").exists()
    )

    core_assets = [
        "./",
        "index.html",
        "manifest.webmanifest",
        "css/style.css",
        *js_modules,
        *data_files,
        "CHANGELOG.md",
        *translated_changelogs,
        "favicon.ico",
        "assets/favicon.svg",
        "assets/icons/icon-192.png",
        "assets/icons/icon-512.png",
        "assets/icons/icon-maskable-192.png",
        "assets/icons/icon-maskable-512.png",
        "assets/icons/apple-touch-icon.png",
    ]

    all_assets = core_assets + signs + situations
    # Content changes must produce a new worker even when the version is reused.
    digest = hashlib.sha256(Path(__file__).read_text(encoding="utf-8").encode("utf-8"))
    for asset in all_assets:
        digest.update(asset.encode("utf-8") + b"\0")
        digest.update((REPO_ROOT / ("index.html" if asset == "./" else asset)).read_bytes())
        digest.update(b"\0")
    cache_name = f"verkeersquiz-v{version}-{digest.hexdigest()[:16]}"

    formatted_assets = "\n".join(f'  "{a}",' for a in all_assets)

    return f"""// Service Worker for Verkeersregels Quiz PWA
const CACHE_NAME = "{cache_name}";

const PRECACHE_ASSETS = [
{formatted_assets}
];

/**
 * Install: precache all core assets and all traffic sign illustrations.
 *
 * @param {{ExtendableEvent}} event - Install event whose lifetime covers the precaching.
 * @returns {{void}}
 */
self.addEventListener("install", (event) => {{
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(
        PRECACHE_ASSETS.map((asset) => new Request(asset, {{ cache: "reload" }}))
      ))
      .then(() => self.skipWaiting())
  );
}});

/**
 * Activate: purge any obsolete caches and claim existing clients.
 *
 * @param {{ExtendableEvent}} event - Activate event whose lifetime covers the cleanup.
 * @returns {{void}}
 */
self.addEventListener("activate", (event) => {{
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {{
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("verkeersquiz-") && name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }})
      .then(() => self.clients.claim())
  );
}});

/**
 * Fetch: serve cached assets offline with cache-first and runtime fallback.
 *
 * Non-GET and cross-origin requests are left to the browser. Navigations go to the
 * network first and fall back to the cached page, while other assets are served from
 * the cache first and added to it after a successful same-origin response.
 *
 * @param {{FetchEvent}} event - Fetch event for the intercepted request.
 * @returns {{void}}
 */
self.addEventListener("fetch", (event) => {{
  const request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") {{
    return;
  }}

  const url = new URL(request.url);

  // Ignore cross-origin API calls (such as Google Apps Script or external docs)
  if (url.origin !== self.location.origin) {{
    return;
  }}

  // For navigation requests: try network first, fallback to cached index.html
  if (request.mode === "navigate") {{
    event.respondWith(
      fetch(request, {{ cache: "no-cache" }})
        .catch(async () => {{
          const cache = await caches.open(CACHE_NAME);
          return (await cache.match("index.html")) || cache.match("./");
        }})
    );
    return;
  }}

  // For static assets: cache-first with network fallback and dynamic caching
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {{
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {{
        return cachedResponse;
      }}
      return fetch(request).then((networkResponse) => {{
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== "basic"
        ) {{
          return networkResponse;
        }}
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {{
          cache.put(request, responseToCache);
        }});
        return networkResponse;
      }});
    }})
  );
}});
""", len(all_assets)


def generate(version: str, logger: TeeLogger) -> int:
    """Writes the updated sw.js file."""
    try:
        content, count = build_sw_content(version)
        SW_PATH.write_text(content, encoding="utf-8")
        logger.log(f"Target file: {SW_PATH}", level="DEBUG")
        logger.log(content.splitlines()[1], level="DEBUG")
        logger.log(f"Generated sw.js with {count} precached assets (version v{version}).", level="INFO")
        return 0
    except OSError as exc:
        logger.log(f"Failed to write sw.js: {exc}", level="ERROR")
        return 1


def main(argv: list[str] | None = None) -> int:
    version = get_project_version()
    parser = build_action_parser(PROG, DESCRIPTION, ACTIONS, DEFAULT_ACTION)
    args = parser.parse_args(argv)

    if args.version or args.action == "version":
        print_version(PROG, version)
        return 0

    if args.help or args.action == "help":
        print_help(PROG, version, DESCRIPTION, parser, EXIT_CODES)
        return 0

    logger = TeeLogger(args.log_file, debug=args.debug, verbose=args.verbose)
    start_time = time.time()
    try:
        logger.log_startup(PROG, version, args.action)
        exit_code = generate(version, logger)
        logger.log_completion(PROG, args.action, exit_code, start_time)
        return exit_code
    finally:
        logger.close()


if __name__ == "__main__":
    sys.exit(main())

