// Browser check of the forecast view against mocked Open-Meteo responses.
// Usage: node tests/forecast-browser.mjs   (set SCREENSHOT_DIR to save screenshots)
import { captureViews, check, launchBrowser, startStaticServer } from "./browser-harness.mjs";

const RAIN = [0, 0, 0, 0.05, 0.4, 1.2, 2.6, 0.3, 0, 0, 0, 0.1, 0];
/**
 * Build the geocoding matches for "Gent" in the requested language.
 *
 * @param {string} lang - Language passed to the geocoding API.
 * @returns {Array<object>} Two matches with localized region and country names.
 */
function places(lang) {
  const nl = lang === "nl";
  return [
    { id: 2797656, name: "Gent", admin1: nl ? "Vlaanderen" : "Flanders", country: nl ? "België" : "Belgium", latitude: 51.05, longitude: 3.71667 },
    { id: 2797657, name: "Gent", admin1: "Gelderland", country: nl ? "Nederland" : "Netherlands", latitude: 51.8, longitude: 5.7 },
  ];
}

/**
 * Build a mocked forecast response starting at 10:00.
 *
 * @returns {object} Forecast API body with 13 hourly steps.
 */
function forecastBody() {
  return {
    timezone: "Europe/Brussels",
    hourly: {
      time: RAIN.map((_, i) => `2026-10-28T${String(10 + i).padStart(2, "0")}:00`),
      temperature_2m: RAIN.map((_, i) => 9.6 + i / 2),
      precipitation: RAIN,
      precipitation_probability: RAIN.map((v) => (v > 0 ? 70 : 5)),
    },
  };
}

/**
 * Answer Open-Meteo requests from fixtures and record the requested URLs.
 *
 * @param {object} context - Playwright browser context.
 * @returns {Promise<string[]>} Live list of intercepted request URLs.
 */
async function mockOpenMeteo(context) {
  const urls = [];
  await context.route("https://geocoding-api.open-meteo.com/**", (route) => {
    urls.push(route.request().url());
    const params = new URL(route.request().url()).searchParams;
    const name = params.get("name").toLowerCase();
    const all = places(params.get("language"));
    if (name === "fout") {
      route.fulfill({ status: 500, json: { error: true } });
      return;
    }
    const results = name === "gent" || name === "traag" ? all : name === "brussel" ? [all[0]] : undefined;
    const answer = () => route.fulfill({ json: results ? { results } : { generationtime_ms: 0.1 } });
    if (name === "traag") {
      setTimeout(answer, 800);
    }
    else {
      answer();
    }
  });
  await context.route("https://api.open-meteo.com/**", (route) => {
    urls.push(route.request().url());
    route.fulfill({ json: forecastBody() });
  });
  return urls;
}

const server = await startStaticServer();
let failed = false;

// Scenario 1: search, pick a place, see the chart; then a single match and an unknown place.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 } });
  try {
    const urls = await mockOpenMeteo(context);
    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.fill("#location-input", "Gent");
    await page.click("#btn-search");
    await page.waitForSelector("#place-choices:not(.hidden) button");
    const choices = await page.$$eval("#place-choices button", (btns) => btns.map((b) => b.textContent.trim()));
    check(choices.length === 2 && choices[0] === "Gent, Flanders, Belgium", "two matches are offered to pick from");
    await page.click("#place-choices li:first-child button");
    await page.waitForSelector("#forecast:not(.hidden)");
    check((await page.$$("#forecast-chart > li")).length === 12, "the chart shows 12 hourly bars");
    check((await page.textContent("#forecast-place")).includes("Gent, Flanders, Belgium"), "the chosen place is the heading");
    check((await page.textContent("#forecast-summary")).includes("13:00"), "the summary names the first rainy hour");
    const label = await page.textContent("#forecast-chart > li:nth-child(5) .sr-only");
    check(label === "14:00: 1.2 mm rain, 70% chance, 12 °C", `bars carry a screen reader description (${label})`);
    const updated = await page.textContent("#forecast-updated");
    check(/\b\d{2}:\d{2}\b/.test(updated) && !/AM|PM/.test(updated), `the update time uses the 24-hour clock (${updated})`);
    const amounts = await page.$$eval("#forecast-chart .forecast-amount", (spans) => spans.map((s) => s.textContent));
    check(amounts[2] === "", "amounts below the 0.1 mm rain threshold get no label");
    check(urls.some((u) => u.includes("latitude=51.05") && u.includes("forecast_hours=13")), "the forecast request uses the picked place");
    const attributionInView = await page.$eval("#forecast a[href='https://open-meteo.com/']", (a) => {
      const box = a.getBoundingClientRect();
      return box.height > 0 && box.bottom <= window.innerHeight;
    });
    check(attributionInView, "the Open-Meteo attribution is visible without scrolling");
    await captureViews(page, "forecast-en");

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    check((await page.textContent("#forecast-summary")).includes("Regen verwacht"), "the forecast re-renders in Dutch");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent.includes("Vlaanderen"));
    check(true, "the place name follows the language switch");
    await captureViews(page, "forecast-nl");

    await page.fill("#location-input", "Xyzzy");
    await page.click("#btn-search");
    await page.waitForSelector("#start-error:not(.hidden)");
    check((await page.textContent("#start-error")).includes("Xyzzy"), "an unknown place shows an error naming it");
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.getElementById("start-error").textContent.startsWith("No place found"));
    check(true, "an error message follows the language switch");

    await page.fill("#location-input", "traag");
    await page.click("#btn-search");
    await page.fill("#location-input", "");
    await page.click("#btn-search");
    await page.waitForTimeout(1200);
    check(await page.isHidden("#place-choices"), "an empty search cancels a slower pending search");
    check((await page.textContent("#start-error")).startsWith("Enter a place"), "an empty search asks for a place");

    await page.fill("#location-input", "fout");
    await page.click("#btn-search");
    await page.waitForFunction(() => document.getElementById("start-error").textContent.includes("not available right now"));
    check(true, "a failing service shows its error message");
    // The mocked HTTP 500 above is intentional; drop its response and console entries from the error gate.
    const expected = (p) => p.includes("name=fout") || p.includes("status of 500");
    problems.splice(0, problems.length, ...problems.filter((p) => !expected(p)));

    await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");
    check(await page.isHidden("#place-choices"), "a single match loads directly from ?location");

    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");
    check((await page.textContent("#forecast-place")).includes("Gent"), "the last location reloads at startup");

    check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 2: current location granted.
{
  const { browser, context, page, problems } = await launchBrowser({
    viewport: { width: 390, height: 844 },
    geolocation: { latitude: 50.8503, longitude: 4.3517 },
    permissions: ["geolocation"],
  });
  try {
    const urls = await mockOpenMeteo(context);
    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.click("#btn-current-location");
    await page.waitForSelector("#forecast:not(.hidden)");
    check((await page.textContent("#forecast-place")).includes("50.85, 4.35"), "the current location shows rounded coordinates");
    check(urls.some((u) => u.includes("latitude=50.85") && u.includes("longitude=4.35")), "the forecast uses the device position");
    check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 3: current location denied.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 } });
  try {
    await mockOpenMeteo(context);
    await context.clearPermissions();
    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.click("#btn-current-location");
    await page.waitForSelector("#start-error:not(.hidden)");
    check((await page.textContent("#start-error")).toLowerCase().includes("location access"), "a denied location shows its error");
    check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

/**
 * Measure the start view layout: overflow of the content area and the boxes of key elements.
 *
 * @param {object} page - Playwright page showing a forecast.
 * @returns {Promise<object>} Overflow in pixels and bounding boxes keyed by element.
 */
function measureStartLayout(page) {
  return page.evaluate(() => {
    const box = (selector) => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    };
    const content = document.getElementById("start-content");
    return {
      overflow: content.scrollHeight - content.clientHeight,
      locate: box("#btn-current-location"),
      input: box("#location-input"),
      place: box("#forecast-place"),
      updated: box(".forecast-updated"),
      chart: box("#forecast-chart"),
    };
  });
}

// Scenario 4: one layout at every size, with the location button beside the field and the details below the chart.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 } });
  try {
    await mockOpenMeteo(context);
    await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");

    for (const [width, height] of [[1280, 900], [1280, 800], [390, 844], [390, 667], [320, 568]]) {
      await page.setViewportSize({ width, height });
      const layout = await measureStartLayout(page);
      const size = `${width}x${height}`;
      const sameRow = Math.abs((layout.locate.top + layout.locate.bottom) - (layout.input.top + layout.input.bottom)) <= 2;
      check(sameRow && layout.locate.right <= layout.input.left, `the current-location button sits left of the search field at ${size}`);
      check(layout.place.top >= layout.chart.bottom, `the place name sits below the chart at ${size}`);
      check(layout.updated.top >= layout.place.bottom, `the update time has its own line below the place name at ${size}`);
      if (size === "1280x800" || size === "390x667") {
        check(layout.overflow <= 0, `the forecast fits without scrolling at ${size} (overflow ${layout.overflow}px)`);
      }
    }
    check(await page.getByRole("button", { name: "Use current location" }).isVisible(), "the icon button keeps its accessible name");
    check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

await server.close();
process.exit(failed ? 1 : 0);
