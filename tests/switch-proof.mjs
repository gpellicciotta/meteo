// Lossless switch proof (support.webapp ADR-0007): screenshots and computed styles of the main pages.
// Capture: node tests/switch-proof.mjs --out <dir> [--root <web-root>]   (the root defaults to this repository)
// Compare: node tests/switch-proof.mjs --compare <before>/styles.json <after>/styles.json
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { launchBrowser, startStaticServer } from "./browser-harness.mjs";

const SIZES = [[390, 844], [1440, 900]];
const THEMES = ["light", "dark"];
const ACCENTS = ["blue", "yellow", "red"];
const PROPERTIES = [
  "color", "background-color", "border-top-color", "border-top-width", "border-radius",
  "font-size", "font-weight", "text-align", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "width", "height", "box-shadow", "outline-style", "transition-duration", "stroke-width",
];

// Key elements of each main page, as the proof's computed-style snapshot; `offline` drops the connection after loading.
const PAGES = {
  start: {
    query: "",
    selectors: ["body", "#start-title", "#start-desc", "#location-input", "#btn-search", "#btn-current-location", "#btn-config", ".start-copyright",
      "#btn-current-location svg", "#btn-config svg", "#btn-about svg"],
  },
  forecast: {
    query: "&location=Brussel",
    ready: "#forecast:not(.hidden)",
    selectors: ["#forecast-summary", ".forecast-card", ".forecast-bar", ".forecast-temp", "#forecast-place", "#btn-change-place",
      "#btn-change-place svg", ".forecast-condition", ".forecast-sky-icon", ".forecast-wind-arrow"],
  },
  about: {
    query: "&view=about",
    ready: "#about-changelog-body .changelog-version-title",
    selectors: [".about-title", "#btn-about-back", ".about-guide-card", ".about-section-heading", ".guide-badge", ".about-icon-badge",
      ".about-source-link", ".about-support-link", ".about-version-tag", ".about-copyright",
      "#btn-about-back svg", ".about-icon-badge svg", ".guide-icon-svg svg", ".about-source-link svg", ".about-support-link .support-icon svg"],
  },
  config: {
    query: "&config=1",
    selectors: ["#config-title", "#btn-config-close", ".config-section", ".config-section-title", ".config-select", ".config-checkbox", "#btn-config-save"],
  },
  offline: {
    query: "",
    offline: true,
    selectors: ["#offline-indicator", "#offline-indicator svg", "#start-desc"],
  },
};

// 10:20 in Brussels, inside the first mocked hour, so the chart shows every mocked hour.
const MOCK_NOW = new Date("2026-10-28T09:20:00Z");
const RAIN = [0, 0, 0, 0.05, 0.4, 1.2, 2.6, 0.3, 0, 0, 0, 0.1, 0];

/**
 * Answer Open-Meteo requests with one fixed place and forecast.
 *
 * @param {object} context - Playwright browser context.
 * @returns {Promise<void>} Resolves once the routes are registered.
 */
async function mockOpenMeteo(context) {
  await context.route("https://geocoding-api.open-meteo.com/**", (route) => route.fulfill({
    json: { results: [{ id: 2800866, name: "Brussel", admin1: "Brussels", country: "Belgium", latitude: 50.85, longitude: 4.35 }] },
  }));
  await context.route("https://api.open-meteo.com/**", (route) => route.fulfill({
    json: {
      timezone: "Europe/Brussels",
      hourly: {
        time: RAIN.map((_, i) => `2026-10-28T${String(10 + i).padStart(2, "0")}:00`),
        temperature_2m: RAIN.map((_, i) => 9.6 + i / 2),
        precipitation: RAIN,
        precipitation_probability: RAIN.map((v) => (v > 0 ? 70 : 5)),
      },
    },
  }));
}

/**
 * Read the computed styles of every selector present on the page.
 *
 * @param {object} page - Playwright page.
 * @param {string[]} selectors - Key element selectors.
 * @returns {Promise<Record<string, Record<string, string>>>} Styles keyed by selector, then property.
 */
function snapshot(page, selectors) {
  return page.evaluate(([list, properties]) => Object.fromEntries(list.map((selector) => {
    const node = document.querySelector(selector);
    if (!node || !node.getClientRects().length) {
      return [selector, { missing: "not rendered" }];
    }
    const style = getComputedStyle(node);
    return [selector, Object.fromEntries(properties.map((name) => [name, style.getPropertyValue(name)]))];
  })), [selectors, PROPERTIES]);
}

/**
 * Capture every page at both widths and themes, and the accents at phone width.
 *
 * @param {string} root - Web root to serve.
 * @param {string} out - Folder for the screenshots and styles.json.
 * @returns {Promise<void>} Resolves once everything is written.
 */
async function capture(root, out) {
  mkdirSync(out, { recursive: true });
  const server = await startStaticServer(root);
  const styles = {};
  try {
    for (const [width, height] of SIZES) {
      for (const theme of THEMES) {
        for (const accent of ACCENTS) {
          // Accents change colors only, so the phone width suffices for them.
          if (accent !== "blue" && width !== 390) {
            continue;
          }
          const { browser, context, page, problems } = await launchBrowser({ viewport: { width, height } });
          try {
            await mockOpenMeteo(context);
            await page.clock.install({ time: MOCK_NOW });
            for (const [name, spec] of Object.entries(PAGES)) {
              const response = await page.goto(`${server.url}?lang=en&theme=${theme}&theme-color=${accent}${spec.query}`, { waitUntil: "networkidle" });
              if (response.status() !== 200) {
                throw new Error(`Page returned ${response.status()}`);
              }
              if (spec.ready) {
                await page.waitForSelector(spec.ready);
              }
              if (spec.offline) {
                await context.setOffline(true);
                await page.waitForSelector("#offline-indicator:not([hidden])");
              }
              await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
              const key = `${name}-${width}-${theme}-${accent}`;
              if (accent === "blue") {
                // Full-page captures misplace sticky bars, so take the viewport, and its end when the page scrolls.
                await page.screenshot({ path: join(out, `${name}-${width}-${theme}.png`) });
                if (await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)) {
                  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
                  await page.screenshot({ path: join(out, `${name}-${width}-${theme}-end.png`) });
                  await page.evaluate(() => window.scrollTo(0, 0));
                }
              }
              styles[key] = await snapshot(page, spec.selectors);
              if (spec.offline) {
                await context.setOffline(false);
              }
              console.log(`captured ${key}`);
            }
            await page.evaluate(async () => {
              const { createIcon } = await import("./js/icons.js");
              const names = Object.keys(await (await fetch("tests/fixtures/icon-geometry.json")).json());
              document.querySelector("main").replaceChildren(...names.map((name) => {
                const row = document.createElement("div");
                row.textContent = name;
                row.append(createIcon(name), createIcon(name, { width: 32, height: 32, strokeWidth: 1.5 }));
                return row;
              }));
            });
            await page.waitForTimeout(100);
            const iconKey = `icons-${width}-${theme}-${accent}`;
            styles[iconKey] = await snapshot(page, [".icon-search", ".icon-weather-clear-day", ".icon-paypal"]);
            if (accent === "blue") {
              await page.screenshot({ path: join(out, `icons-${width}-${theme}.png`), fullPage: true });
            }
            if (problems.length) {
              throw new Error(problems.join("\n"));
            }
          }
          finally {
            await browser.close();
          }
        }
      }
    }
  }
  finally {
    await server.close();
  }
  writeFileSync(join(out, "styles.json"), `${JSON.stringify(styles, null, 2)}\n`);
}

/**
 * Print every computed style that differs between two snapshots, grouped by selector and property.
 *
 * @param {string} beforePath - styles.json of the base commit.
 * @param {string} afterPath - styles.json after the switch.
 * @returns {void}
 */
function compare(beforePath, afterPath) {
  const before = JSON.parse(readFileSync(beforePath, "utf-8"));
  const after = JSON.parse(readFileSync(afterPath, "utf-8"));
  const groups = new Map();
  for (const [key, selectors] of Object.entries(before)) {
    for (const [selector, properties] of Object.entries(selectors)) {
      const next = after[key]?.[selector] ?? { missing: "absent" };
      for (const name of new Set([...Object.keys(properties), ...Object.keys(next)])) {
        if (properties[name] !== next[name]) {
          const group = `${selector} ${name}`;
          const change = `${properties[name] ?? "-"} -> ${next[name] ?? "-"}`;
          if (!groups.has(group)) {
            groups.set(group, new Map());
          }
          const cases = groups.get(group);
          cases.set(change, [...(cases.get(change) ?? []), key]);
        }
      }
    }
  }
  for (const [group, changes] of groups) {
    for (const [change, keys] of changes) {
      console.log(`${group}: ${change} [${keys.length} cases: ${keys.slice(0, 3).join(", ")}${keys.length > 3 ? ", ..." : ""}]`);
    }
  }
  console.log(`${groups.size} differing selector properties`);
}

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
if (option("--compare")) {
  compare(option("--compare"), args[args.indexOf("--compare") + 2]);
}
else if (option("--out")) {
  await capture(resolve(option("--root") ?? "."), resolve(option("--out")));
}
else {
  console.error("Usage: node tests/switch-proof.mjs --out <dir> [--root <web-root>] | --compare <before.json> <after.json>");
  process.exit(2);
}
