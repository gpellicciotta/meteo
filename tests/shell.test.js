import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JS_DIR = join(ROOT, "js");

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
 * Load a string dictionary.
 *
 * @param {string} lang - Language code.
 * @returns {Record<string, string>} Parsed dictionary.
 */
function strings(lang) {
  return JSON.parse(read(`data/strings.${lang}.json`));
}

/**
 * List the JavaScript modules of the app.
 *
 * @returns {string[]} File names inside js/.
 */
function jsModules() {
  return readdirSync(JS_DIR).filter((f) => f.endsWith(".js")).sort();
}

describe("string dictionaries", () => {
  it("share the same keys in Dutch and English", () => {
    expect(Object.keys(strings("en")).sort()).toEqual(Object.keys(strings("nl")).sort());
  });

  it("contain every i18n key used in index.html", () => {
    const html = read("index.html");
    const keys = [...html.matchAll(/data-i18n(?:-aria|-tooltip|-placeholder)?="([\w.]+)"/g)].map((m) => m[1]);
    expect(keys.length).toBeGreaterThan(10);
    for (const lang of ["nl", "en"]) {
      const dict = strings(lang);
      expect(keys.filter((k) => !(k in dict)), lang).toEqual([]);
    }
  });

  it("contain every literal t() key used in the modules", () => {
    for (const file of jsModules()) {
      const code = readFileSync(join(JS_DIR, file), "utf-8");
      const keys = [...code.matchAll(/\bt\(\s*["']([\w.]+)["']/g)].map((m) => m[1]);
      for (const lang of ["nl", "en"]) {
        const dict = strings(lang);
        expect(keys.filter((k) => !(k in dict)), `${file} (${lang})`).toEqual([]);
      }
    }
  });
});

describe("modules and markup", () => {
  it("resolve every relative import", () => {
    for (const file of jsModules()) {
      const code = readFileSync(join(JS_DIR, file), "utf-8");
      const imports = [...code.matchAll(/from\s+["'](\.\/[\w./-]+)["']/g)].map((m) => m[1]);
      for (const spec of imports) {
        expect(existsSync(join(JS_DIR, spec)), `${file} imports ${spec}`).toBe(true);
      }
    }
  });

  it("only look up element ids that exist in index.html", () => {
    const html = read("index.html");
    const ids = [...read("js/dom.js").matchAll(/getElementById\("([\w-]+)"\)/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(5);
    expect(ids.filter((id) => !html.includes(`id="${id}"`))).toEqual([]);
  });
});

describe("browser storage", () => {
  it("prefixes every localStorage key with meteo_ to stay apart from sibling apps on the same origin", () => {
    const sources = [read("index.html"), ...jsModules().map((f) => readFileSync(join(JS_DIR, f), "utf-8"))].join("\n");
    const literalKeys = [...sources.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
    const constantKeys = [...sources.matchAll(/_STORAGE_KEY\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]);
    const keys = [...literalKeys, ...constantKeys];
    expect(keys.length).toBeGreaterThan(1);
    expect(keys.filter((k) => !k.startsWith("meteo_"))).toEqual([]);
  });
});

describe("service worker", () => {
  it("precaches existing files including every module", () => {
    const sw = read("sw.js");
    const block = sw.match(/const PRECACHE_ASSETS = \[([\s\S]*?)\];/)[1];
    const assets = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(assets.filter((a) => a !== "./" && !existsSync(join(ROOT, a)))).toEqual([]);
    for (const file of jsModules()) {
      expect(assets).toContain(`js/${file}`);
    }
    expect(sw).toMatch(/const CACHE_NAME = "meteo-v/);
  });
});

describe("changelogs", () => {
  it("start with the same version in English and Dutch", () => {
    const heading = (rel) => read(rel).match(/^##\s+(\S+)/m)[1];
    expect(heading("CHANGELOG.nl.md")).toBe(heading("CHANGELOG.md"));
  });
});

describe("app icon and manifest", () => {
  it("names the app Meteo and points at existing icon files", () => {
    const manifest = JSON.parse(read("manifest.webmanifest"));
    expect(manifest.name).toBe("Meteo");
    expect(manifest.short_name).toBe("Meteo");
    expect(manifest.categories).toContain("weather");
    expect(manifest.icons.length).toBeGreaterThan(3);
    expect(manifest.icons.filter((icon) => !existsSync(join(ROOT, icon.src))).map((icon) => icon.src)).toEqual([]);
  });

  it("uses a weather favicon instead of the copied traffic sign", () => {
    const svg = read("assets/favicon.svg");
    expect(svg).toMatch(/^<svg\s[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(svg).not.toMatch(/Calque_1|Illustrator|#0071B3/i);
    expect(svg).toMatch(/<title>Meteo<\/title>/);
  });
});
