import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Read a repository file as UTF-8 text.
 *
 * @param {string} rel - Path relative to the repository root.
 * @returns {string} File contents.
 */
function read(rel) {
  return readFileSync(join(ROOT, rel), "utf-8");
}

const REMOVED_ICONS = [
  "check", "pause", "info", "stats", "carousel", "quiz", "report", "link", "chevronLeft", "chevronRight",
  "arrowUp", "arrowRight", "share", "print", "heart", "play",
];
const REMOVED_CLASSES = [
  "badge-amber", "badge-blue", "btn-secondary", "btn-about-back", "start-header-actions", "start-meta-hint",
  "start-meta-info", "about-header-spacer", "config-header-spacer", "view-footer-spacer", "config-field-warning",
  "no-print",
];
const REMOVED_TOKENS = [
  "--color-correct", "--color-correct-bg", "--color-correct-border", "--color-correct-text",
  "--color-wrong-border", "--color-warning", "--color-overlay", "--radius-lg", "--shadow-modal",
];
// Built from the changelog area names at run time, so no markup or script names them.
const DYNAMIC_CLASS = /^changelog-badge-/;

/**
 * Build a pattern matching a name that is not part of a longer identifier.
 *
 * @param {string} name - Class, token, or icon name.
 * @returns {RegExp} Whole-name pattern.
 */
function whole(name) {
  return new RegExp(`(?<![\\w-])${name}(?![\\w-])`);
}

const css = read("css/style.css").replace(/\/\*[\s\S]*?\*\//g, "");
const html = read("index.html");
const scripts = readdirSync(join(ROOT, "js")).filter((f) => f !== "icons.js").map((f) => read(`js/${f}`)).join("\n");
// Element ids share names with classes, so id lookups do not count as class usage.
const classScripts = scripts.replace(/getElementById\("[^"]*"\)/g, "");
const iconNames = [...read("js/icons.js").matchAll(/^ {2}"?([A-Za-z-]+)"?: `/gm)].map((m) => m[1]);
const cssClasses = [...new Set([...css.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((m) => m[1]))].filter((c) => !/^\d+$/.test(c));
const markupClasses = new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
const cssTokens = [...new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))];

describe("quiz leftovers", () => {
  it.each(REMOVED_ICONS)("icon %s is not defined", (name) => {
    expect(iconNames).not.toContain(name);
  });

  it.each(REMOVED_CLASSES)("class %s is nowhere in the stylesheet, markup, or scripts", (name) => {
    expect(css).not.toMatch(whole(`\\.${name}`));
    expect(markupClasses.has(name)).toBe(false);
    expect(classScripts).not.toMatch(whole(name));
  });

  it.each(REMOVED_TOKENS)("token %s is nowhere in the stylesheet, markup, or scripts", (name) => {
    expect(css).not.toMatch(whole(name));
    expect(html).not.toMatch(whole(name));
    expect(scripts).not.toMatch(whole(name));
  });

  it("every defined icon is placed in the markup or created by a script", () => {
    const unused = iconNames.filter((name) => {
      const placed = html.includes(`data-icon="${name}"`);
      const created = new RegExp(`(?:createIcon|appendIcon|renderIconSlot)\\(\\s*"${name}"`).test(scripts);
      return !placed && !created;
    });
    expect(unused).toEqual([]);
  });

  it("every stylesheet class is used by the markup or the scripts", () => {
    const unused = cssClasses.filter((c) => !DYNAMIC_CLASS.test(c) && !markupClasses.has(c) && !whole(c).test(classScripts));
    expect(unused).toEqual([]);
  });

  it("every custom property is read by a rule, the markup, or a script", () => {
    const unused = cssTokens.filter((t) => !new RegExp(`var\\(${t}(?![\\w-])`).test(css) && !whole(t).test(html + scripts));
    expect(unused).toEqual([]);
  });
});
