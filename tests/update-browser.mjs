// Browser check of the service worker update flow: install, a changed worker, the Update toast, and the reload.
// Usage: node tests/update-browser.mjs   (serves a temporary copy, since the scenario edits sw.js; set SCREENSHOT_DIR to save screenshots)
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { captureViews, check, launchBrowser, ROOT, startStaticServer } from "./browser-harness.mjs";

const WEB_FILES = ["index.html", "sw.js", "manifest.webmanifest", "favicon.ico", "CHANGELOG.md", "CHANGELOG.nl.md", "assets", "css", "data", "js", "vendor"];
const strings = JSON.parse(readFileSync(join(ROOT, "data/strings.en.json"), "utf-8"));
const dutch = JSON.parse(readFileSync(join(ROOT, "data/strings.nl.json"), "utf-8"));

const copy = mkdtempSync(join(tmpdir(), "meteo-update-"));
for (const name of WEB_FILES) {
  cpSync(join(ROOT, name), join(copy, name), { recursive: true });
}
const server = await startStaticServer(copy);
const { browser, page, problems } = await launchBrowser({ serviceWorkers: "allow", viewport: { width: 390, height: 844 } });

/**
 * Read the service worker state the page sees.
 *
 * @returns {Promise<{controlled: boolean, waiting: boolean, caches: string[], toasts: string[]}>} Worker state.
 */
function workerState() {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      controlled: Boolean(navigator.serviceWorker.controller),
      waiting: Boolean(registration?.waiting),
      caches: await caches.keys(),
      toasts: [...document.querySelectorAll(".toast-region .toast")].map((toast) => toast.textContent.trim()),
    };
  });
}

try {
  await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 15000 });
  const first = await workerState();
  check(first.controlled && first.caches.length === 1, "the first install precaches every asset and controls the page");
  check(first.toasts.length === 0, "the first install shows no Update toast");

  const sw = join(copy, "sw.js");
  writeFileSync(sw, readFileSync(sw, "utf-8").replace(/const CACHE_NAME = "([^"]+)";/, 'const CACHE_NAME = "$1-next";'));
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  const toast = page.locator(".app__overlays .toast-region .toast");
  await toast.waitFor({ timeout: 15000 });
  const waiting = await workerState();
  check(waiting.waiting && waiting.caches.length === 2, "the changed worker installs and waits instead of taking over");
  check((await toast.locator(".toast__text").textContent()) === strings["pwa.update_ready"], "the Update toast shows the English ready text");
  const action = toast.getByRole("button", { name: strings["pwa.update_action"] });
  check(await action.isVisible(), "the Update toast offers the Update action");
  await page.locator("#btn-lang").click();
  await page.waitForFunction((text) => document.querySelector(".toast__text")?.textContent === text, dutch["pwa.update_ready"]);
  check(await toast.getByRole("button", { name: dutch["pwa.update_action"] }).isVisible(), "an open Update toast follows the selected language");
  await page.locator("#btn-lang").click();
  await page.waitForFunction((text) => document.querySelector(".toast__text")?.textContent === text, strings["pwa.update_ready"]);

  for (const screen of ["config", "about"]) {
    const tab = await page.context().newPage();
    tab.on("console", (message) => {
      if (message.type() === "error") {
        problems.push(`console: ${message.text()}`);
      }
    });
    tab.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
    tab.on("requestfailed", (request) => problems.push(`requestfailed: ${request.url()}`));
    tab.on("response", (response) => {
      if (response.status() >= 400) {
        problems.push(`http ${response.status()}: ${response.url()}`);
      }
    });
    try {
      await tab.addInitScript(() => {
        const original = window.fetch.bind(window);
        window.fetch = async (...args) => {
          if (String(args[0]).includes("data/strings.")) {
            await new Promise((resolve) => { window.releaseTexts = resolve; });
          }
          return original(...args);
        };
      });
      await tab.goto(`${server.url}?lang=en`, { waitUntil: "domcontentloaded" });
      await tab.waitForFunction(() => typeof window.releaseTexts === "function");
      await tab.waitForTimeout(300);
      check(await tab.locator(".toast").count() === 0, "a waiting worker offers no toast before startup translations settle");
      await tab.evaluate(() => window.releaseTexts());
      const button = tab.getByRole("button", { name: strings["pwa.update_action"], exact: true });
      await button.waitFor();
      check(await tab.locator(".toast__text").textContent() === strings["pwa.update_ready"], "an already-waiting worker uses the loaded startup language");
      await tab.locator(screen === "config" ? "#btn-config" : "#btn-about").click();
      await button.focus();
      await button.press("Escape");
      check(await tab.locator(".toast").count() === 0, `Escape dismisses the focused toast on ${screen}`);
      check(await tab.locator(`#screen-${screen}`).isVisible(), `Escape keeps ${screen} open when the toast consumes it`);
    }
    finally {
      await tab.close();
    }
  }
  const layout = await page.evaluate(() => {
    const toastBox = document.querySelector(".toast-region .toast").getBoundingClientRect();
    const bar = document.querySelector(".app__action-bar").getBoundingClientRect();
    return {
      clear: toastBox.bottom <= bar.top,
      text: getComputedStyle(document.querySelector(".toast__text")).color,
      body: getComputedStyle(document.body).color,
    };
  });
  check(layout.clear, "the Update toast stays above the taller start action bar");
  check(layout.text === layout.body, `the toast text keeps the text color, not the app's muted paragraphs (${layout.text})`);
  await captureViews(page, "update-toast");
  await page.waitForTimeout(9000);
  check(await toast.isVisible(), "the Update toast stays past the 8 second expiry of ordinary toasts");

  const reloaded = page.waitForEvent("load", { timeout: 15000 });
  await action.click();
  await reloaded;
  await page.waitForLoadState("networkidle");
  const updated = await workerState();
  check(!updated.waiting && updated.controlled, "Update activates the waiting worker and reloads under it");
  check(updated.caches.length === 1 && updated.caches[0].endsWith("-next"), "the new worker removes the old cache");
  check(updated.toasts.length === 0, "the reloaded page shows no Update toast");

  check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
}
finally {
  await browser.close();
  await server.close();
  rmSync(copy, { recursive: true, force: true });
}
