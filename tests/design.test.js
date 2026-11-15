// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The public bright entry point, the only vendored stylesheet the app imports (ADR-0005).
const BRIGHT_ENTRY = "vendor/design/looks/bright/index.css";
const SPRITE = "vendor/design/looks/bright/icons.svg";

/**
 * Read a repository file as UTF-8 text.
 *
 * @param {string} rel - Path relative to the repository root.
 * @returns {string} File contents.
 */
function read(rel) {
  return readFileSync(join(ROOT, rel), "utf-8");
}

/**
 * List the @import targets of a stylesheet, resolved against the repository root.
 *
 * @param {string} rel - Stylesheet path relative to the repository root.
 * @returns {string[]} Imported paths relative to the repository root.
 */
function imports(rel) {
  return [...read(rel).matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => posix.join(posix.dirname(rel), m[1]));
}

/**
 * List a file and everything it pulls in, recursively, with the given import lister.
 *
 * @param {string} rel - Entry path relative to the repository root.
 * @param {(rel: string) => string[]} lister - Lists the direct imports of a file.
 * @returns {string[]} The entry and every file it reaches.
 */
function closure(rel, lister) {
  const seen = [];
  const visit = (file) => {
    if (!seen.includes(file)) {
      seen.push(file);
      lister(file).forEach(visit);
    }
  };
  visit(rel);
  return seen;
}

/**
 * List the relative module imports of a script, resolved against the repository root.
 *
 * @param {string} rel - Script path relative to the repository root.
 * @returns {string[]} Imported module paths relative to the repository root.
 */
function moduleImports(rel) {
  return [...read(rel).matchAll(/^\s*(?:import|export)\s[^;]*?from\s+["'](\.{1,2}\/[^"']+)["']/gm)].map((m) => posix.join(posix.dirname(rel), m[1]));
}

/**
 * List the precached assets of sw.js.
 *
 * @returns {string[]} PRECACHE_ASSETS entries.
 */
function precached() {
  const block = read("sw.js").match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/)[1];
  return [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

/**
 * Parse index.html into a document, leaving its stylesheets and scripts unloaded.
 *
 * @returns {Document} Parsed page.
 */
function page() {
  return new DOMParser().parseFromString(read("index.html").replace(/<link[^>]*>|<script[\s\S]*?<\/script>/g, ""), "text/html");
}

describe("vendored design system", () => {
  it("pins support.webapp 0.1.0 with the bright look and checks the app stylesheets", () => {
    expect(JSON.parse(read("design.json"))).toEqual({ version: "0.1.0", look: "bright", target: "vendor/design", styles: ["css"] });
    expect(JSON.parse(read("vendor/design/manifest.json")).version).toBe("0.1.0");
    expect(existsSync(join(ROOT, "vendor/design/bin/check.mjs"))).toBe(true);
  });

  it("imports the public bright entry point before the app tokens, and no private file", () => {
    expect(imports("css/style.css")).toEqual([BRIGHT_ENTRY, "css/tokens.css"]);
    expect(closure("css/style.css", imports).filter((file) => !existsSync(join(ROOT, file)))).toEqual([]);
  });

  it("precaches every stylesheet, module, and sprite the page loads, so the shell works offline", () => {
    const stylesheets = closure("css/style.css", imports);
    const modules = closure("js/app.js", moduleImports);
    expect(stylesheets).toContain("vendor/design/css/components/banner.css");
    expect(modules).toEqual(expect.arrayContaining(["vendor/design/js/toast.js", "vendor/design/js/live-region.js", "vendor/design/js/sw-update.js"]));
    expect([...stylesheets, ...modules, SPRITE].filter((file) => !precached().includes(file))).toEqual([]);
  });
});

describe("service worker update", () => {
  it("waits for the page's skip-waiting message instead of activating on install, and claims clients", () => {
    const sw = read("sw.js");
    const install = sw.match(/addEventListener\("install"[\s\S]*?\n\}\);/)[0];
    expect(install).not.toMatch(/skipWaiting/);
    expect(sw).toMatch(/addEventListener\("message"[\s\S]*?type === "skip-waiting"[\s\S]*?self\.skipWaiting\(\)/);
    expect(sw).toMatch(/self\.clients\.claim\(\)/);
  });

  it("offers updates through the vendored module and toast, not a reload of its own", () => {
    const pwa = read("js/pwa.js");
    expect(pwa).toMatch(/from "\.\.\/vendor\/design\/js\/sw-update\.js"/);
    expect(pwa).toMatch(/from "\.\.\/vendor\/design\/js\/toast\.js"/);
    expect(pwa).not.toMatch(/location\.reload/);
  });
});

describe("app shell markup", () => {
  it("uses the meteo setup: page scroll in the narrow column", () => {
    const body = page().body;
    expect([...body.classList].sort()).toEqual(["app", "app--scroll-page", "app--width-narrow"]);
  });

  it("orders the areas as the meteo skeleton does, with a skip link first", () => {
    const children = [...page().body.children].map((child) => `${child.tagName.toLowerCase()}.${child.classList[0]}`);
    expect(children).toEqual([
      "a.skip-link",
      "header.app__top-bar",
      "div.app__banners",
      "main.app__main",
      "div.app__action-bar",
      "div.app__overlays",
    ]);
    const doc = page();
    expect(doc.querySelector(".skip-link").getAttribute("href")).toBe("#main");
    expect(doc.querySelector(".app__main").id).toBe("main");
    expect(doc.querySelector(".app__main").getAttribute("tabindex")).toBe("-1");
    expect(doc.querySelector(".app__overlays > .toast-region[role='region']")).not.toBeNull();
  });

  it("keeps the three screens as sections of the main area", () => {
    const sections = [...page().querySelectorAll(".app__main > section")].map((section) => `${section.id}:${section.dataset.screen}`);
    expect(sections).toEqual(["screen-start:start", "screen-about:about", "screen-config:config"]);
  });

  it("shows the offline indicator as a banner, hidden with the attribute the banners area reads", () => {
    const indicator = page().querySelector(".app__banners > #offline-indicator");
    expect(indicator).not.toBeNull();
    expect(indicator.hasAttribute("hidden")).toBe(true);
    expect(read("js/pwa.js")).toMatch(/offlineIndicator\.hidden = isOnline/);
  });

  it("builds the offline banner from the vendored warning banner skeleton with a sprite icon", () => {
    const indicator = page().querySelector("#offline-indicator");
    expect([...indicator.classList]).toEqual(["banner", "banner--warning"]);
    expect(indicator.getAttribute("role")).toBe("status");
    const icon = indicator.querySelector(":scope > svg.icon[aria-hidden='true'] > use");
    expect(icon.getAttribute("href")).toBe(`${SPRITE}#icon-sync-offline`);
    expect(indicator.querySelector(":scope > p.banner__text").dataset.i18n).toBe("start.offline");
  });

  it("leaves the vendored icon class to sprite icons, so it never resizes the app's own icons", () => {
    const icons = read("js/icons.js");
    expect(icons).toMatch(/const classNames = \["app-icon", `icon-\$\{name\}`\]/);
    expect(read("css/style.css")).not.toMatch(/(?<![\w-])\.icon(?![\w-])/);
  });
});

describe("app stylesheets", () => {
  it("keep raw colors in css/tokens.css only", () => {
    const css = read("css/style.css").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css.match(/#[\da-f]{3,8}\b|\brgba?\(/gi) ?? []).toEqual([]);
  });

  it("keep no copy of the offline indicator the banner replaces", () => {
    const css = ["css/style.css", "css/tokens.css"].map(read).join("\n");
    expect(css).not.toMatch(/offline-indicator|offline-icon|--color-notice-border/);
  });

  it("use no private bright primitives, such as --radius-sm and --radius-md", () => {
    const primitives = [...read("vendor/design/looks/bright/primitives.css").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
    for (const file of ["css/style.css", "css/tokens.css"]) {
      const used = [...new Set(read(file).match(/(?<![\w-])--[\w-]+/g))];
      expect(used.filter((token) => primitives.includes(token)), file).toEqual([]);
    }
  });
});

it("precaches each asset only once", () => {
  const assets = precached();
  expect(assets.length).toBe(new Set(assets).size);
});
