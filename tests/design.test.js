// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The private layers imported until T0034 switches to the public bright entry point.
const VENDORED_LAYERS = [
  "vendor/design/css/base.css",
  "vendor/design/css/reset.css",
  "vendor/design/css/shell.css",
  "vendor/design/looks/bright/primitives.css",
  "vendor/design/looks/bright/look.css",
];

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

  it("imports the vendored layers before the app tokens, all from existing files", () => {
    expect(imports("css/style.css")).toEqual([...VENDORED_LAYERS, "css/tokens.css"]);
    expect([...VENDORED_LAYERS, "css/tokens.css"].filter((file) => !existsSync(join(ROOT, file)))).toEqual([]);
  });

  it("precaches every stylesheet the page imports, so the shell works offline", () => {
    const block = read("sw.js").match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/)[1];
    const assets = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect([...VENDORED_LAYERS, "css/tokens.css"].filter((file) => !assets.includes(file))).toEqual([]);
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
});

describe("app stylesheets", () => {
  it("keep raw colors in css/tokens.css only", () => {
    const css = read("css/style.css").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css.match(/#[\da-f]{3,8}\b|\brgba?\(/gi) ?? []).toEqual([]);
  });

  it("use no private bright primitives, such as --radius-sm and --radius-md", () => {
    const primitives = [...read("vendor/design/looks/bright/primitives.css").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);
    for (const file of ["css/style.css", "css/tokens.css"]) {
      const used = [...new Set(read(file).match(/(?<![\w-])--[\w-]+/g))];
      expect(used.filter((token) => primitives.includes(token)), file).toEqual([]);
    }
  });
});
