// Browser check of the application shell: start, Settings and About views.
// Usage: node tests/shell-browser.mjs   (set SCREENSHOT_DIR to save screenshots)
import { captureViews, check, launchBrowser, startStaticServer } from "./browser-harness.mjs";

const server = await startStaticServer();
const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 } });
let failed = false;

try {
  await page.goto(`${server.url}?lang=nl`, { waitUntil: "networkidle" });
  check((await page.textContent("#start-title")) === "Meteo", "start view shows the Meteo title");
  check((await page.getAttribute("html", "lang")) === "nl", "Dutch is active with ?lang=nl");
  await captureViews(page, "start");
  for (const asset of ["manifest.webmanifest", "assets/favicon.svg", "favicon.ico", "assets/icons/icon-192.png"]) {
    check((await page.request.get(`${server.url}${asset}`)).status() === 200, `${asset} loads with HTTP 200`);
  }

  await page.click("#btn-config");
  check(await page.isVisible("#screen-config"), "Settings view opens");
  const languages = await page.$$eval("#config-language option", (opts) => opts.map((o) => o.value));
  check(languages.join(",") === "nl,en", "Settings offers only Dutch and English");
  await page.selectOption("#config-language", "en");
  await page.click("#btn-config-save");
  await page.waitForFunction(() => document.documentElement.lang === "en");
  check(await page.isVisible("#screen-start"), "saving returns to the start view");
  check((await page.textContent("#btn-lang .btn-lang-label")) === "EN", "language button shows EN");

  await page.click("#btn-about");
  check(await page.isVisible("#screen-about"), "About view opens");
  await page.waitForFunction(() => /^v\d/.test(document.getElementById("about-version-tag").textContent));
  check(true, "About view shows the version tag");
  await captureViews(page, "about");
  await page.click("#btn-about-back");

  await page.click("#btn-lang");
  await page.waitForFunction(() => document.documentElement.lang === "nl");
  check(true, "language button switches back to Dutch");
  check(await page.evaluate(() => localStorage.getItem("lang") === null), "the language is not stored under the shared key \"lang\"");

  await page.click("#btn-about");
  await page.waitForFunction(() => document.getElementById("about-changelog-body").textContent.includes("gestart"));
  check(true, "About shows the Dutch changelog in Dutch");
  await page.click("#btn-about-back");

  await page.click("#btn-config");
  await page.selectOption("#config-theme", "dark");
  check((await page.getAttribute("html", "data-theme")) === "dark", "choosing the dark theme previews it at once");
  await page.keyboard.press("Escape");
  check((await page.getAttribute("html", "data-theme")) === "light", "closing Settings without saving reverts the preview");
  check(await page.isVisible("#screen-start"), "Escape returns to the start view");
  await page.click("#btn-config");
  await page.selectOption("#config-theme-color", "yellow");
  check((await page.getAttribute("html", "data-accent")) === "yellow", "choosing the yellow accent previews it as data-accent");
  await page.keyboard.press("Escape");
  check((await page.getAttribute("html", "data-accent")) === "blue", "closing Settings without saving reverts the accent preview");

  // A listener added after the app's own one sees whether the app prevented the browser's help.
  await page.evaluate(() => document.addEventListener("keydown", (e) => {
    window.f1Prevented = e.key === "F1" ? e.defaultPrevented : window.f1Prevented;
  }));
  await page.keyboard.press("F1");
  check(await page.isVisible("#screen-about") && await page.isHidden("#screen-start"), "F1 opens the About view from the start view");
  check(await page.evaluate(() => window.f1Prevented === true), "F1 prevents the browser's own help");
  await page.evaluate(() => window.scrollTo(0, 400));
  check(await page.evaluate(() => window.scrollY > 0), "the About view scrolls the page, as the shell's page scroll mode does");
  await page.keyboard.press("F1");
  check(await page.isVisible("#screen-about") && await page.evaluate(() => window.scrollY === 0),
    "F1 in the About view keeps it open and scrolls back to the guide");
  await captureViews(page, "about-f1");
  await page.keyboard.press("Escape");
  await page.click("#btn-config");
  await page.selectOption("#config-theme", "dark");
  await page.keyboard.press("F1");
  check(await page.isVisible("#screen-about") && await page.isHidden("#screen-config"), "F1 in Settings opens the About view");
  check((await page.getAttribute("html", "data-theme")) === "light", "F1 in Settings reverts the unsaved theme preview");
  await page.keyboard.press("Escape");
  check(await page.isVisible("#screen-start"), "Escape returns to the start view after F1");

  await context.setOffline(true);
  await page.waitForSelector("#offline-indicator.banner:not([hidden])");
  const banner = await page.evaluate(() => ({
    text: getComputedStyle(document.querySelector("#offline-indicator .banner__text")).color,
    body: getComputedStyle(document.body).color,
    icon: document.querySelector("#offline-indicator > svg.icon").getBoundingClientRect().width,
  }));
  check(banner.text === banner.body, `the offline banner text keeps the text color, not the app's muted paragraphs (${banner.text})`);
  check(banner.icon > 0, "the offline banner draws its sprite icon");
  await context.setOffline(false);
  await page.waitForSelector("#offline-indicator[hidden]", { state: "attached" });
  check(true, "the offline banner hides once the browser is back online");

  check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
}
catch (err) {
  failed = true;
  console.error(err.message);
}
finally {
  await browser.close();
}

/**
 * Return the horizontal center of an element in CSS pixels.
 *
 * @param {object} page - Playwright page.
 * @param {string} selector - Element selector.
 * @returns {Promise<number>} Center x coordinate.
 */
function centerOf(page, selector) {
  return page.$eval(selector, (e) => {
    const r = e.getBoundingClientRect();
    return r.left + r.width / 2;
  });
}

// Header titles are centered on phones and desktops.
for (const width of [390, 1280]) {
  const { browser: sized, page: sizedPage, problems: sizedProblems } = await launchBrowser({ viewport: { width, height: 844 } });
  try {
    await sizedPage.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    const contentCenter = await centerOf(sizedPage, "#start-content");
    for (const selector of ["#start-title", "#start-desc"]) {
      const offset = Math.abs((await centerOf(sizedPage, selector)) - contentCenter);
      check(offset <= 1, `${selector} is centered at ${width}px (off by ${offset.toFixed(1)}px)`);
    }
    await sizedPage.click("#btn-about");
    const aboutOffset = Math.abs((await centerOf(sizedPage, ".about-title")) - (await centerOf(sizedPage, "#screen-about")));
    check(aboutOffset <= 1, `the About title is centered at ${width}px (off by ${aboutOffset.toFixed(1)}px)`);
    check(sizedProblems.length === 0, `no console, page or network errors at ${width}px${sizedProblems.length ? `:\n${sizedProblems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await sized.close();
  }
}

/**
 * Resolve a CSS color expression, such as a custom property, to the color the browser computes.
 *
 * @param {object} page - Playwright page.
 * @param {string} expression - CSS color value, such as "var(--color-focus)".
 * @returns {Promise<string>} Computed color, such as "rgb(26, 86, 219)".
 */
function resolveColor(page, expression) {
  return page.evaluate((value) => {
    const probe = document.createElement("span");
    probe.style.color = value;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, expression);
}

/**
 * Convert a #rrggbb color to the rgb() form of computed styles.
 *
 * @param {string} hex - Color such as "#1a56db".
 * @returns {string} Color such as "rgb(26, 86, 219)".
 */
function rgb(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}

// The app shell at phone and desktop widths, in both themes.
for (const width of [390, 1440]) {
  for (const theme of ["light", "dark"]) {
    const size = `${width}px ${theme}`;
    const { browser: sized, page: sizedPage, problems: sizedProblems } = await launchBrowser({ viewport: { width, height: width === 390 ? 844 : 900 } });
    try {
      await sizedPage.goto(`${server.url}?lang=en&theme=${theme}`, { waitUntil: "networkidle" });
      const layout = await sizedPage.evaluate(() => {
        const main = document.getElementById("main");
        const style = getComputedStyle(main);
        return {
          horizontal: document.documentElement.scrollWidth - window.innerWidth,
          topBar: getComputedStyle(document.querySelector(".app__top-bar")).position,
          actionBar: getComputedStyle(document.querySelector(".app__action-bar")).position,
          column: main.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
          narrow: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--width-narrow")) * 16,
          banners: getComputedStyle(document.querySelector(".app__banners")).display,
        };
      });
      check(layout.horizontal <= 0, `no horizontal scroll at ${size} (${layout.horizontal}px)`);
      check(layout.topBar === "sticky" && layout.actionBar === "sticky", `the top bar and the action bar stick at ${size}`);
      check(layout.column <= layout.narrow + 0.5 && (width < layout.narrow || layout.column >= layout.narrow - 0.5),
        `the main column fills up to --width-narrow, ${layout.narrow}px, at ${size} (${layout.column.toFixed(1)}px)`);
      check(layout.banners === "none", `the banners area takes no room while online at ${size}`);

      await sizedPage.keyboard.press("Tab");
      const skip = await sizedPage.evaluate(() => {
        const r = document.activeElement.getBoundingClientRect();
        return { cls: document.activeElement.className, top: r.top, bottom: r.bottom };
      });
      check(skip.cls === "skip-link" && skip.top >= 0 && skip.bottom > skip.top, `Tab first reaches the visible skip link at ${size}`);
      await sizedPage.keyboard.press("Tab");
      const ring = await sizedPage.evaluate(() => {
        const style = getComputedStyle(document.activeElement);
        return { id: document.activeElement.id, style: style.outlineStyle, width: style.outlineWidth, color: style.outlineColor };
      });
      const focusColor = await resolveColor(sizedPage, "var(--color-focus)");
      check(ring.id === "btn-current-location" && ring.style === "solid" && ring.width === "2px" && ring.color === focusColor,
        `keyboard focus shows the shared 2px focus ring at ${size} (${ring.style} ${ring.width} ${ring.color})`);

      const durations = await sizedPage.$$eval(".btn-start-arrow, .start-meta-item, .location-input, .config-select",
        (nodes) => nodes.map((node) => getComputedStyle(node).transitionDuration));
      check(durations.length > 4 && durations.every((value) => value.split(",").every((part) => parseFloat(part) === 0)),
        `reduced motion turns every control transition off at ${size} (${[...new Set(durations)].join(" | ")})`);
      check(sizedProblems.length === 0, `no shell console, page or network errors at ${size}${sizedProblems.length ? `:\n${sizedProblems.join("\n")}` : ""}`);
    }
    catch (err) {
      failed = true;
      console.error(err.message);
    }
    finally {
      await sized.close();
    }
  }
}

// The palette overrides of T0031 on the shared contract tokens; docs/specs/visual-style-guide.md lists them.
const PALETTE = {
  "light blue": { primary: "#1a56db", "primary-hover": "#163f9e", "primary-active": "#163f9e", "on-primary": "#ffffff", link: "#1a56db", "link-hover": "#1a56db", focus: "#1a56db" },
  "dark blue": { primary: "#2563eb", "primary-hover": "#1d4ed8", "primary-active": "#1d4ed8", "on-primary": "#ffffff", link: "#93c5fd", "link-hover": "#93c5fd", focus: "#60a5fa" },
  "light yellow": { primary: "#b88000", "primary-hover": "#a16207", "primary-active": "#a16207", "on-primary": "#ffffff", link: "#a16207", "link-hover": "#854d0e", focus: "#b88000" },
  "dark yellow": { primary: "#d97706", "primary-hover": "#b45309", "primary-active": "#b45309", "on-primary": "#ffffff", link: "#d97706", "link-hover": "#fde68a", focus: "#d97706" },
  "light red": { primary: "#dc2626", "primary-hover": "#b91c1c", "primary-active": "#b91c1c", "on-primary": "#ffffff", link: "#b91c1c", "link-hover": "#991b1b", focus: "#dc2626" },
  "dark red": { primary: "#dc2626", "primary-hover": "#b91c1c", "primary-active": "#b91c1c", "on-primary": "#ffffff", link: "#fca5a5", "link-hover": "#fca5a5", focus: "#dc2626" },
};
const TEXT = {
  light: { text: "#1f2933", "text-muted": "#6b7280" },
  dark: { text: "#f1f5f9", "text-muted": "#94a3b8" },
};
{
  const { browser: palette, page: palettePage, problems: paletteProblems } = await launchBrowser({ viewport: { width: 390, height: 844 } });
  try {
    for (const [name, tokens] of Object.entries(PALETTE)) {
      const [theme, accent] = name.split(" ");
      await palettePage.goto(`${server.url}?lang=en&theme=${theme}&theme-color=${accent}`, { waitUntil: "networkidle" });
      check((await palettePage.getAttribute("html", "data-accent")) === accent, `the ${name} page sets data-accent="${accent}"`);
      const expected = { ...tokens, ...TEXT[theme] };
      const wrong = [];
      for (const [token, hex] of Object.entries(expected)) {
        const actual = await resolveColor(palettePage, `var(--color-${token})`);
        if (actual !== rgb(hex)) {
          wrong.push(`--color-${token} ${actual} instead of ${hex}`);
        }
      }
      check(wrong.length === 0, `the ${name} contract tokens follow the assessed overrides${wrong.length ? `: ${wrong.join("; ")}` : ""}`);
    }
    check(paletteProblems.length === 0, `no palette console, page or network errors${paletteProblems.length ? `:\n${paletteProblems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await palette.close();
  }
}

await server.close();
process.exit(failed ? 1 : 0);
