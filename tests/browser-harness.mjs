import { createServer } from "node:http";
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
};

/**
 * Serve the repository root over HTTP on a free local port.
 *
 * Runs inside the test process, so no separate server process needs to be stopped.
 *
 * @returns {Promise<{url: string, close: () => Promise<void>}>} Base URL and a close function.
 */
export function startStaticServer() {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const file = normalize(join(ROOT, path.endsWith("/") ? `${path}index.html` : path));
    try {
      if (!file.startsWith(ROOT) || !statSync(file).isFile()) {
        throw new Error("not a file");
      }
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(readFileSync(file));
    }
    catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });
  return new Promise((resolveStart) => {
    server.listen(0, "127.0.0.1", () => {
      resolveStart({
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => new Promise((resolveClose) => server.close(() => resolveClose())),
      });
    });
  });
}

/**
 * Launch Chrome and collect every console error, page error and failed request.
 *
 * @param {object} [contextOptions] - Extra Playwright browser context options.
 * @returns {Promise<{browser: object, context: object, page: object, problems: string[]}>} Browser handles.
 */
export async function launchBrowser(contextOptions = {}) {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({ serviceWorkers: "block", ...contextOptions });
  const page = await context.newPage();
  const problems = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      problems.push(`console: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => problems.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => problems.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`));
  page.on("response", (res) => {
    if (res.status() >= 400) {
      problems.push(`http ${res.status()}: ${res.url()}`);
    }
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  return { browser, context, page, problems };
}

/**
 * Save light and dark screenshots on desktop and mobile when SCREENSHOT_DIR is set.
 *
 * @param {object} page - Playwright page showing the view to capture.
 * @param {string} name - File name prefix.
 * @returns {Promise<void>} Resolves once all screenshots are written.
 */
export async function captureViews(page, name) {
  const dir = process.env.SCREENSHOT_DIR;
  if (!dir) {
    return;
  }
  mkdirSync(dir, { recursive: true });
  // Theme switches animate colors, so captures taken mid-transition would show mixed themes.
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
  const viewport = page.viewportSize();
  for (const [device, size] of [["desktop", { width: 1280, height: 800 }], ["mobile", { width: 390, height: 844 }]]) {
    await page.setViewportSize(size);
    for (const scheme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.screenshot({ path: join(dir, `${name}-${device}-${scheme}.png`), fullPage: true });
    }
  }
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  if (viewport) {
    await page.setViewportSize(viewport);
  }
}

/**
 * Throw when a condition does not hold, so the script exits non-zero.
 *
 * @param {boolean} condition - Condition expected to be true.
 * @param {string} message - Failure description.
 * @returns {void}
 */
export function check(condition, message) {
  if (!condition) {
    throw new Error(`Check failed: ${message}`);
  }
  console.log(`ok - ${message}`);
}
