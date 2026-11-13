// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTheme, initTheme } from "../js/theme.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACCENTS = ["blue", "yellow", "red"];
const GUIDE = "docs/specs/visual-style-guide.md";

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
 * Parse the plain rules of a stylesheet into selector and declarations.
 *
 * @param {string} css - Stylesheet text without nested blocks.
 * @returns {{selector: string, tokens: Record<string, string>}[]} Rules in source order.
 */
function rules(css) {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim().replace(/\s+/g, " "),
    tokens: Object.fromEntries([...m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((d) => [d[1], d[2].trim().toLowerCase()])),
  }));
}

/**
 * List the body rows of the Markdown table in one section of a document.
 *
 * @param {string} text - Markdown document.
 * @param {string} heading - Exact level-2 heading text of the section.
 * @returns {string[][]} Trimmed cells of each row, without the header and separator rows.
 */
function tableRows(text, heading) {
  const section = text.split(/^## /m).find((part) => part.startsWith(`${heading}\n`)) ?? "";
  const rows = section.split("\n").filter((line) => line.startsWith("|")).map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()));
  return rows.filter((cells) => !cells.every((cell) => /^:?-+:?$/.test(cell))).slice(1);
}

// Each meteo rule that overrides contract tokens, by the case label the style guide uses.
const LABELS = {
  ":root": "Default",
  ":root, :root[data-accent=\"blue\"]": "Light blue",
  ":root[data-accent=\"yellow\"]": "Light yellow",
  ":root[data-accent=\"red\"]": "Light red",
  ":root[data-theme=\"dark\"]": "Dark",
  ":root[data-theme=\"dark\"][data-accent=\"blue\"], :root[data-theme=\"dark\"]:not([data-accent=\"yellow\"]):not([data-accent=\"red\"])": "Dark blue",
  ":root[data-theme=\"dark\"][data-accent=\"yellow\"]": "Dark yellow",
  ":root[data-theme=\"dark\"][data-accent=\"red\"]": "Dark red",
};
const contract = new Set(JSON.parse(read("vendor/design/contract.json")).tokens.map((token) => token.name));
const overrides = rules(read("css/tokens.css")).map((rule) => ({
  ...rule,
  tokens: Object.fromEntries(Object.entries(rule.tokens).filter(([name]) => contract.has(name))),
})).filter((rule) => Object.keys(rule.tokens).length);
const primitives = rules(read("vendor/design/looks/bright/primitives.css"))[0].tokens;
const look = rules(read("vendor/design/looks/bright/look.css").split("@supports")[0]);

/**
 * Split a case label into its theme and accent.
 *
 * @param {string} label - Case label such as "Dark yellow" or "Default".
 * @returns {{dark: boolean, accent: string}} Theme and accent of the case.
 */
function caseOf(label) {
  const [theme, accent] = label.toLowerCase().split(" ");
  return { dark: theme === "dark", accent: accent ?? "blue" };
}

/**
 * Resolve a bright token for one case from the look's rules and primitives.
 *
 * @param {string} label - Case label.
 * @param {string} name - Token name.
 * @returns {string|undefined} Resolved value, or undefined when the look does not set it.
 */
function bright(label, name) {
  const { dark, accent } = caseOf(label);
  const accentRule = label === "Default" || label === "Dark" ? undefined : look.find((rule) => rule.selector === `[data-accent="${accent}"]`);
  const raw = accentRule?.tokens[name] ?? look.find((rule) => rule.selector === ":root").tokens[name];
  if (raw === undefined) {
    return undefined;
  }
  const picked = raw.startsWith("light-dark(") ? raw.slice(11, -1).split(",")[dark ? 1 : 0].trim() : raw;
  const ref = picked.match(/^var\((--[\w-]+)\)$/);
  return ref ? (primitives[ref[1]] ?? bright(label, ref[1])) : picked;
}

/**
 * Resolve the value a token takes for one case: meteo's override, else the look's value.
 *
 * @param {string} label - Case label such as "Light yellow".
 * @param {string} name - Token name.
 * @returns {string|undefined} Effective value.
 */
function effective(label, name) {
  const { dark } = caseOf(label);
  const applies = ["Default", ...(dark ? ["Dark"] : []), label];
  const values = overrides.filter((rule) => applies.includes(LABELS[rule.selector])).map((rule) => rule.tokens[name]).filter(Boolean);
  return values.at(-1) ?? bright(label, name);
}

/**
 * Compute the WCAG 2.2 contrast ratio of two hex colors.
 *
 * @param {string} a - First color, such as "#ffffff".
 * @param {string} b - Second color.
 * @returns {number} Contrast ratio from 1 to 21.
 */
function contrast(a, b) {
  const luminance = (hex) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-accent");
  document.documentElement.removeAttribute("data-theme-color");
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("accent attribute", () => {
  it.each(ACCENTS)("applyTheme sets data-accent to %s and no data-theme-color", (accent) => {
    applyTheme("light", accent);
    expect(document.documentElement.getAttribute("data-accent")).toBe(accent);
    expect(document.documentElement.hasAttribute("data-theme-color")).toBe(false);
  });

  it("applyTheme lowercases the accent and defaults to blue", () => {
    applyTheme("light", "Yellow");
    expect(document.documentElement.getAttribute("data-accent")).toBe("yellow");
    applyTheme("light", null);
    expect(document.documentElement.getAttribute("data-accent")).toBe("blue");
  });

  it("keeps the accent from data-accent when the OS theme changes", () => {
    let onChange = null;
    vi.spyOn(window, "matchMedia").mockImplementation(() => ({
      matches: false,
      addEventListener: (_, handler) => {
        onChange = handler;
      },
    }));
    initTheme();
    applyTheme("system", "red");
    onChange();
    expect(document.documentElement.getAttribute("data-accent")).toBe("red");
  });

  it("sets data-accent in the startup script from the URL and from the stored preference", () => {
    const script = read("index.html").match(/<script>([\s\S]*?)<\/script>/)[1];
    window.history.replaceState(null, "", "/?theme-color=geel");
    new Function(script)();
    expect(document.documentElement.getAttribute("data-accent")).toBe("yellow");
    window.history.replaceState(null, "", "/");
    localStorage.setItem("meteo_preferences", JSON.stringify({ themeColor: "red" }));
    new Function(script)();
    expect(document.documentElement.getAttribute("data-accent")).toBe("red");
    expect(document.documentElement.hasAttribute("data-theme-color")).toBe(false);
  });

  it("leaves no use of the renamed data-theme-color attribute", () => {
    const files = ["index.html", "sw.js", "README.md", ...readdirSync(join(ROOT, "js")).map((f) => `js/${f}`), ...readdirSync(join(ROOT, "css")).map((f) => `css/${f}`)];
    expect(files.filter((file) => read(file).includes("data-theme-color"))).toEqual([]);
  });

  it("overrides the look's accent rules with :root selectors, which outrank them whatever the load order", () => {
    expect(overrides.map((rule) => rule.selector).filter((selector) => !(selector in LABELS))).toEqual([]);
    expect(overrides.filter((rule) => /data-accent/.test(rule.selector) && !rule.selector.split(", ").every((s) => s.startsWith(":root"))))
      .toEqual([]);
  });
});

describe("style guide", () => {
  it("is linked from docs/index.md", () => {
    expect(read("docs/index.md")).toContain("(specs/visual-style-guide.md)");
  });

  it("lists every contract token override with meteo's and the look's value", () => {
    const rows = tableRows(read(GUIDE), "Palette overrides");
    const listed = rows.map(([label, token, meteo, look]) => `${label} ${token} ${meteo} ${look}`);
    const expected = overrides.flatMap((rule) => Object.entries(rule.tokens).map(([name, value]) => {
      const label = LABELS[rule.selector];
      return `${label} \`${name}\` \`${value}\` \`${bright(label, name)}\``;
    }));
    expect(listed.sort()).toEqual(expected.sort());
  });

  it("lists each AA exception with its measured ratio below the minimum", () => {
    const rows = tableRows(read(GUIDE), "AA exceptions");
    expect(rows.length).toBeGreaterThan(0);
    for (const [label, fg, bg, ratio, minimum] of rows) {
      const measured = contrast(effective(label, fg.replaceAll("`", "")), effective(label, bg.replaceAll("`", "")));
      expect(`${label} ${fg} on ${bg}: ${ratio}`).toBe(`${label} ${fg} on ${bg}: ${(Math.floor(measured * 100) / 100).toFixed(2)}`);
      expect(measured, `${label} ${fg} on ${bg}`).toBeLessThan(Number(minimum));
    }
  });

  it.each(["Light yellow", "Dark yellow"])("lists the white labels on the %s fill as an AA exception", (label) => {
    expect(effective(label, "--color-on-primary")).toBe("#ffffff");
    const rows = tableRows(read(GUIDE), "AA exceptions").filter(([l, fg, bg]) => l === label && fg === "`--color-on-primary`" && bg === "`--color-primary`");
    expect(rows).toHaveLength(1);
  });
});
