// Browser check of the forecast view against mocked Open-Meteo responses.
// Usage: node tests/forecast-browser.mjs   (set SCREENSHOT_DIR to save screenshots)
import { captureViews, check, launchBrowser, startStaticServer } from "./browser-harness.mjs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const RAIN = [0, 0, 0, 0.05, 0.4, 1.2, 2.6, 0.3, 0, 0, 0, 0.1, 0];

// 10:20 in Brussels, inside the first hour of the mocked forecasts, so the chart shows every mocked hour.
const MOCK_NOW = new Date("2026-10-28T09:20:00Z");
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
      wind_speed_10m: [40, ...Array(11).fill(20), 99],
      wind_gusts_10m: [99, ...Array(11).fill(35), 70],
      weather_code: [61, ...Array(12).fill(0)],
      is_day: RAIN.map(() => 1),
    },
  };
}

/**
 * Build a mocked forecast response of 25 hourly steps from 10:00 to 10:00 the next day.
 *
 * @returns {object} Forecast API body, repeating the last step of forecastBody() after 22:00.
 */
function dayForecastBody() {
  const body = forecastBody();
  for (const [key, values] of Object.entries(body.hourly)) {
    body.hourly[key] = Array.from({ length: 25 }, (_, i) => values[Math.min(i, values.length - 1)]);
  }
  body.hourly.time = body.hourly.time.map((_, i) => new Date(Date.UTC(2026, 9, 28, 10 + i)).toISOString().slice(0, 16));
  return body;
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

/**
 * Build a mocked Nominatim reverse answer in the shape of the Sint-Niklaas sample.
 *
 * @param {boolean} nl - True for the Dutch names.
 * @returns {object} Reverse API body.
 */
function reverseBody(nl) {
  return {
    name: "Sint-Niklaas",
    address: {
      town: "Sint-Niklaas", municipality: "Sint-Niklaas", county: "Sint-Niklaas",
      state: nl ? "Oost-Vlaanderen" : "East Flanders", postcode: "9100", country: nl ? "België" : "Belgium", country_code: "be",
    },
  };
}

const OSM_LINK = "#forecast a[href='https://www.openstreetmap.org/copyright']";

/**
 * Show the search row through the footer button when a shown forecast has hidden it.
 *
 * @param {object} page - Playwright page.
 * @returns {Promise<void>} Resolves once the search field is visible.
 */
async function openSearch(page) {
  if (await page.isHidden("#location-form")) {
    await page.click("#btn-change-place");
    await page.waitForSelector("#location-form:not(.hidden)");
  }
}

const server = await startStaticServer();
let failed = false;

// Hourly labels stay separated as the chart resizes, retaining every accessible hour.
{
  const { browser, context, page, problems } = await launchBrowser();
  try {
    await mockOpenMeteo(context);
    await page.clock.install({ time: MOCK_NOW });
    const failures = [];
    for (const lang of ["en", "nl"]) {
      check((await page.goto(`${server.url}?lang=${lang}&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
        `${lang} hourly-label scenario receives HTTP 200`);
      await page.waitForSelector("#forecast:not(.hidden)");
      await page.evaluate(() => document.fonts.ready);
      for (const width of [320, 390, 479, 480, 1280]) {
        await page.setViewportSize({ width, height: width < 480 ? 844 : 800 });
        for (const scheme of ["light", "dark"]) {
          await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
          const layout = await page.evaluate(() => {
            const hours = [...document.querySelectorAll("#forecast-chart > li")];
            const labels = hours.map((hour) => hour.querySelector(".forecast-time"))
              .filter((label) => getComputedStyle(label).visibility !== "hidden" && label.getClientRects().length);
            const bounds = labels.map((label) => {
              const range = document.createRange();
              range.selectNodeContents(label);
              const rect = range.getBoundingClientRect();
              return { left: rect.left, right: rect.right };
            });
            return {
              count: labels.length,
              gap: Math.min(...bounds.slice(1).map((rect, i) => rect.left - bounds[i].right)),
              contained: bounds.every((rect) => rect.left >= 0 && rect.right <= innerWidth),
              overflow: document.documentElement.scrollWidth > innerWidth,
              descriptions: hours.map((hour) => hour.querySelector(".sr-only").textContent),
              bars: document.querySelectorAll("#forecast-chart .forecast-bar").length,
              temperatureRows: hours.map((hour) => hour.querySelector(".forecast-temp").getBoundingClientRect().top),
            };
          });
          if (process.env.SCREENSHOT_DIR && width === 320) {
            mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
            await page.screenshot({ path: join(process.env.SCREENSHOT_DIR, `hourly-${lang}-320-${scheme}.png`), fullPage: true });
          }
          const size = `${lang}/${scheme}/${width}px`;
          if (layout.gap < 2) {
            failures.push(`${size}: time labels need a 2px gap (actual ${layout.gap.toFixed(2)}px)`);
          }
          if (layout.count !== (width < 480 ? 6 : 12) || !layout.contained || layout.overflow) {
            failures.push(`${size}: label count or horizontal containment is incorrect`);
          }
          if (layout.bars !== 12 || layout.descriptions.length !== 12
            || !layout.descriptions.every((text, i) => text.startsWith(i === 0 ? `${lang === "nl" ? "Nu" : "Now"}:` : `${10 + i}:00:`))
            || Math.max(...layout.temperatureRows) - Math.min(...layout.temperatureRows) > 1) {
            failures.push(`${size}: hourly data or temperature alignment changed`);
          }
        }
      }
    }
    check(problems.length === 0, `no hourly-label console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
    check(failures.length === 0, `hourly labels remain separated across 20 language/theme/viewport combinations${failures.length ? `:\n${failures.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 1: search, pick a place, see the chart; then a single match and an unknown place.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 } });
  try {
    const urls = await mockOpenMeteo(context);
    await page.clock.install({ time: MOCK_NOW });
    check((await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" })).status() === 200, "the local server returns HTTP 200");
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
    check((await page.textContent("#forecast-summary")).endsWith("°C.\nWind up to 40 km/h, gusts up to 70 km/h."), "English wind and gust maxima follow the temperature");
    check(urls.some((u) => new URL(u).searchParams.get("hourly")?.includes("wind_speed_10m,wind_gusts_10m")), "the request includes both wind variables");
    const label = await page.textContent("#forecast-chart > li:nth-child(5) .sr-only");
    check(label === "14:00: 1.2 mm rain, 70% chance, 12 °C", `bars carry a screen reader description (${label})`);
    const updated = await page.textContent("#forecast-updated");
    check(/\b\d{2}:\d{2}\b/.test(updated) && !/AM|PM/.test(updated), `the update time uses the 24-hour clock (${updated})`);
    const amounts = await page.$$eval("#forecast-chart .forecast-amount", (spans) => spans.map((s) => s.textContent));
    check(amounts[2] === "", "amounts below the 0.1 mm rain threshold get no label");
    check(urls.some((u) => u.includes("latitude=51.05") && u.includes("forecast_hours=25")), "the forecast request uses the picked place");
    const attributionInView = await page.$eval("#forecast a[href='https://open-meteo.com/']", (a) => {
      const box = a.getBoundingClientRect();
      return box.height > 0 && box.bottom <= window.innerHeight;
    });
    check(attributionInView, "the Open-Meteo attribution is visible without scrolling");
    await captureViews(page, "forecast-en");

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    check((await page.textContent("#forecast-summary")).includes("Regen verwacht"), "the forecast re-renders in Dutch");
    check((await page.textContent("#forecast-summary")).endsWith("°C.\nWind tot 40 km/u, windstoten tot 70 km/u."), "the wind summary re-renders in Dutch");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent.includes("Vlaanderen"));
    check(true, "the place name follows the language switch");
    await captureViews(page, "forecast-nl");

    await openSearch(page);
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
    const reverseUrls = [];
    let reverseFails = false;
    await context.route("https://nominatim.openstreetmap.org/**", (route) => {
      reverseUrls.push(route.request().url());
      const nl = new URL(route.request().url()).searchParams.get("accept-language") === "nl";
      return reverseFails ? route.fulfill({ status: 500, json: { error: true } }) : route.fulfill({ json: reverseBody(nl) });
    });
    await page.clock.install({ time: MOCK_NOW });
    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.click("#btn-current-location");
    await page.waitForSelector("#forecast:not(.hidden)");
    check(urls.some((u) => u.includes("latitude=50.85") && u.includes("longitude=4.35")), "the forecast uses the device position");
    check(await page.isHidden("#location-form"), "the current location forecast hides the search row");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent.includes("Sint-Niklaas"));
    check((await page.textContent("#forecast-place")) === "Sint-Niklaas, East Flanders, Belgium (current location)",
      "the current location shows its town, province and country");
    check(reverseUrls.length === 1 && reverseUrls[0].includes("lat=50.850&lon=4.352") && reverseUrls[0].includes("accept-language=en"),
      `the name is looked up once with rounded coordinates (${reverseUrls.join(", ")})`);
    check(await page.isVisible(OSM_LINK), "the OpenStreetMap attribution is shown with the looked-up name");
    await captureViews(page, "current-location-en");

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent.includes("Oost-Vlaanderen"));
    check((await page.textContent("#forecast-place")) === "Sint-Niklaas, Oost-Vlaanderen, België (huidige locatie)",
      "the current location name follows the language switch");
    check(reverseUrls.length === 2 && reverseUrls[1].includes("accept-language=nl"), "the language switch looks up the Dutch name");
    await captureViews(page, "current-location-nl");
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent.includes("East Flanders"));

    reverseFails = true;
    await openSearch(page);
    await Promise.all([
      page.waitForResponse((response) => response.url().startsWith("https://nominatim.openstreetmap.org/")),
      page.click("#btn-current-location"),
    ]);
    await page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"));
    check((await page.textContent("#forecast-place")) === "Current location (50.85, 4.35)", "a failed lookup keeps the rounded coordinates");
    check(await page.isHidden("#start-error"), "a failed lookup shows no error");
    check(await page.isHidden(OSM_LINK), "the OpenStreetMap attribution is hidden with the coordinates");

    await openSearch(page);
    await page.fill("#location-input", "Brussel");
    await page.click("#btn-search");
    await page.waitForFunction(() => document.getElementById("forecast-place").textContent === "Gent, Flanders, Belgium");
    check(await page.isHidden(OSM_LINK), "the OpenStreetMap attribution is hidden for a searched place");
    // The mocked HTTP 500 lookup above is intentional; drop its response and console entries from the error gate.
    problems.splice(0, problems.length, ...problems.filter((p) => !p.includes("nominatim.openstreetmap.org") && !p.includes("status of 500")));
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
    await page.clock.install({ time: MOCK_NOW });
    await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");
    await openSearch(page);

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
    // A shown tooltip must not add its text to the name, so check while the button has keyboard focus.
    // Keyboard order follows the visual order: location button, search field, submit button.
    await page.focus("#location-input");
    await page.keyboard.press("Shift+Tab");
    const focusedId = await page.evaluate(() => document.activeElement.id);
    const named = await page.getByRole("button", { name: "Use current location", exact: true }).count();
    check(focusedId === "btn-current-location" && named === 1, `the focused icon button is named exactly once (${focusedId}, ${named} match)`);
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

// Scenario 5: calm wind, threshold boundaries, rounding, and independently missing series.
{
  const { browser, context, page, problems } = await launchBrowser();
  try {
    await mockOpenMeteo(context);
    await page.clock.install({ time: MOCK_NOW });
    const cases = [
      [20, 35, "Wind up to 20 km/h.", "Wind tot 20 km/u."],
      [20.4, 49.9, "Wind up to 20 km/h.", "Wind tot 20 km/u."],
      [20.6, 50, "Wind up to 21 km/h, gusts up to 50 km/h.", "Wind tot 21 km/u, windstoten tot 50 km/u."],
      [40, 70.6, "Wind up to 40 km/h, gusts up to 71 km/h.", "Wind tot 40 km/u, windstoten tot 71 km/u."],
      [0, 0, "Wind up to 0 km/h.", "Wind tot 0 km/u."],
      [null, null, "", ""],
      [20, null, "Wind up to 20 km/h.", "Wind tot 20 km/u."],
      [null, 70, "Gusts up to 70 km/h.", "Windstoten tot 70 km/u."],
      [null, 35, "", ""],
    ];
    for (const [speed, gusts, en, nl] of cases) {
      const body = forecastBody();
      body.hourly.wind_speed_10m = RAIN.map(() => speed);
      body.hourly.wind_gusts_10m = RAIN.map(() => gusts);
      await context.route("https://api.open-meteo.com/**", (route) => route.fulfill({ json: body }));
      await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" });
      await page.waitForSelector("#forecast:not(.hidden)");
      for (const [lang, expected] of [["en", en], ["nl", nl]]) {
        if (lang === "nl") {
          await page.click("#btn-lang");
          await page.waitForFunction(() => document.documentElement.lang === "nl");
        }
        const summary = await page.textContent("#forecast-summary");
        check(summary.split("°C.")[1] === (expected ? `\n${expected}` : ""), `${lang} summary handles speed ${speed}, gusts ${gusts}`);
      }
    }
    check(problems.length === 0, `no wind scenario console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 6: current-hour icons, language changes, missing data, and inline phone layout.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 } });
  try {
    const urls = await mockOpenMeteo(context);
    let body = forecastBody();
    await context.route("https://api.open-meteo.com/**", (route) => {
      urls.push(route.request().url());
      return route.fulfill({ json: body });
    });
    await page.clock.install({ time: MOCK_NOW });
    check((await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
      "condition scenario receives HTTP 200");
    await page.waitForSelector("#forecast:not(.hidden)");
    const summary = page.locator("#forecast-summary");
    const text = (await summary.textContent()).trim();
    const height = (await summary.boundingBox()).height;
    check(await summary.getByRole("img", { name: "Rain", exact: true }).count() === 1, "rain icon has an accessible English name");
    check(await summary.locator(":scope > svg:first-child.icon-weather-rain").count() === 1,
      "current-hour rain icon precedes the summary text");
    check(urls.some((u) => new URL(u).searchParams.get("hourly")?.includes("weather_code,is_day")),
      "the request includes weather code and daylight");
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    check(await summary.getByRole("img", { name: "Regen", exact: true }).count() === 1, "rain icon follows the Dutch language switch");
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "en");

    for (const [code, day, icon, label] of [
      [0, 0, "clear-night", "Clear"], [0, 1, "clear-day", "Clear"],
      [2, 0, "partly-night", "Partly cloudy"], [2, 1, "partly-day", "Partly cloudy"],
      [3, 1, "cloudy", "Cloudy"], [45, 1, "fog", "Fog"],
      [71, 1, "snow", "Snow"], [95, 1, "thunder", "Thunderstorm"],
      [null, 1, null, null], [999, 1, null, null], [0, null, null, null],
    ]) {
      body = forecastBody();
      body.hourly.weather_code[0] = code;
      body.hourly.is_day[0] = day;
      if (code === null) {
        delete body.hourly.weather_code;
      }
      await openSearch(page);
      await Promise.all([
        page.waitForResponse((response) => response.url().startsWith("https://api.open-meteo.com/")),
        page.click("#btn-search"),
      ]);
      await page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"));
      const actualText = (await summary.textContent()).trim();
      check(actualText === text, `condition ${code}/${day} preserves the summary text${actualText === text ? "" : `: ${actualText}`}`);
      if (icon) {
        check(await summary.getByRole("img", { name: label, exact: true }).count() === 1
          && await summary.locator(`svg.icon-weather-${icon}`).count() === 1, `condition ${code}/${day} renders ${icon}`);
        check(await summary.locator("svg").count() === 1, "refresh replaces the previous condition icon");
      }
      else {
        check(await summary.locator("svg").count() === 0, `condition ${code}/${day} omits the icon`);
        check(Math.abs((await summary.boundingBox()).height - height) < 1, "icon adds no summary line at 390px");
      }
      if (icon === "clear-night") {
        await captureViews(page, "condition-night");
      }
    }
    check(problems.length === 0, `no condition scenario console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 7: a stale forecast refreshes quietly when the app becomes visible again.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 }, timezoneId: "Europe/Brussels" });
  try {
    await mockOpenMeteo(context);
    const forecastUrls = [];
    let answer = (route) => route.fulfill({ json: forecastBody() });
    await context.route("https://api.open-meteo.com/**", (route) => {
      forecastUrls.push(route.request().url());
      return answer(route);
    });
    await page.clock.install({ time: new Date(2026, 9, 28, 10, 0) });
    check((await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
      "refresh scenario receives HTTP 200");
    await page.waitForSelector("#forecast:not(.hidden)");
    const updated = () => page.textContent("#forecast-updated");
    const becomeVisible = () => page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    const settle = () => page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"))
      .then(() => page.waitForTimeout(300));
    check(forecastUrls.length === 1 && (await updated()).includes("10:00"), "the first forecast is fetched at 10:00");

    await page.clock.fastForward("05:00");
    await becomeVisible();
    await settle();
    check(forecastUrls.length === 1, "a 5-minute-old forecast is not refreshed");

    answer = (route) => new Promise((resolve) => setTimeout(resolve, 500)).then(() => route.fulfill({ json: forecastBody() }));
    await page.clock.fastForward("11:00");
    await becomeVisible();
    await page.waitForTimeout(200);
    const whileLoading = await page.evaluate(() => ({
      status: document.getElementById("forecast-status").classList.contains("hidden"),
      bars: document.querySelectorAll("#forecast-chart > li").length,
    }));
    check(whileLoading.status && whileLoading.bars === 12, "a background refresh keeps the chart and shows no loading line");
    await page.waitForFunction(() => document.getElementById("forecast-updated").textContent.includes("10:16"));
    check(forecastUrls.length === 2, "a 16-minute-old forecast is refreshed once on visibilitychange");

    answer = (route) => route.fulfill({ status: 500, json: { error: true } });
    await page.clock.fastForward("16:00");
    await becomeVisible();
    await settle();
    check(forecastUrls.length === 3, "a stale forecast requests a refresh again");
    const kept = await page.evaluate(() => ({
      error: document.getElementById("start-error").classList.contains("hidden"),
      bars: document.querySelectorAll("#forecast-chart > li").length,
      updated: document.getElementById("forecast-updated").textContent,
    }));
    check(kept.error && kept.bars === 12 && kept.updated.includes("10:16"), "a failed refresh keeps the chart and update time without an error");
    // The mocked HTTP 500 above is intentional; drop its response and console entries from the error gate.
    problems.splice(0, problems.length, ...problems.filter((p) => !p.includes("api.open-meteo.com") && !p.includes("status of 500")));

    answer = (route) => route.fulfill({ json: forecastBody() });
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await page.waitForFunction(() => document.getElementById("forecast-updated").textContent.includes("10:32"));
    check(forecastUrls.length === 4, "a page restored from the back-forward cache refreshes a stale forecast");

    await page.clock.fastForward("16:00");
    await context.setOffline(true);
    await becomeVisible();
    await settle();
    await context.setOffline(false);
    check(forecastUrls.length === 4 && (await updated()).includes("10:32"), "an offline device skips the refresh");
    check(problems.length === 0, `no refresh scenario console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 8: the first column reads "Now" in bold only while it is the current hour of the forecast timezone.
{
  // A device timezone far from the forecast's proves the forecast timezone decides the current hour.
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 320, height: 568 }, timezoneId: "Asia/Tokyo" });
  try {
    await mockOpenMeteo(context);
    const body = forecastBody();
    body.hourly.precipitation = [0, 0.6, ...RAIN.slice(2)];
    await context.route("https://api.open-meteo.com/**", (route) => route.fulfill({ json: body }));
    // 10:20 in Brussels, so the first forecast hour (10:00) is the current one.
    await page.clock.install({ time: new Date("2026-10-28T09:20:00Z") });
    check((await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
      "now-label scenario receives HTTP 200");
    await page.waitForSelector("#forecast:not(.hidden)");
    await page.evaluate(() => document.fonts.ready);
    await captureViews(page, "now-en");
    const readChart = () => page.evaluate(() => {
      const hours = [...document.querySelectorAll("#forecast-chart > li")];
      const bounds = hours.map((hour) => hour.querySelector(".forecast-time"))
        .filter((label) => getComputedStyle(label).visibility !== "hidden")
        .map((label) => {
          const range = document.createRange();
          range.selectNodeContents(label);
          return range.getBoundingClientRect();
        });
      return {
        labels: hours.map((hour) => hour.querySelector(".forecast-time").textContent),
        weights: hours.map((hour) => getComputedStyle(hour.querySelector(".forecast-time")).fontWeight),
        nowClass: hours.map((hour) => hour.classList.contains("is-now")),
        description: hours[0].querySelector(".sr-only").textContent,
        gap: Math.min(...bounds.slice(1).map((rect, i) => rect.left - bounds[i].right)),
        summary: document.getElementById("forecast-summary").textContent.trim(),
      };
    });
    const clockLabels = (chart) => chart.labels.slice(1).every((label, i) => label === `${11 + i}:00`);
    let chart = await readChart();
    check(chart.labels[0] === "Now" && chart.weights[0] === "700", `the current hour is labeled "Now" in bold (${chart.labels[0]}, ${chart.weights[0]})`);
    check(clockLabels(chart) && chart.weights.slice(1).every((w) => w !== "700") && chart.nowClass.filter(Boolean).length === 1,
      "the other hours keep their clock times in regular weight");
    check(chart.description.startsWith("Now: 0.6 mm rain"), `the screen reader description says "Now" (${chart.description})`);
    check(chart.gap >= 2, `the "Now" label keeps a 2px gap at 320px (${chart.gap.toFixed(2)}px)`);
    check(chart.summary.startsWith("Rain expected now (up to 2.6 mm per hour)."), `the summary says rain is expected now (${chart.summary})`);

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    await captureViews(page, "now-nl");
    chart = await readChart();
    check(chart.labels[0] === "Nu" && chart.weights[0] === "700" && clockLabels(chart), `the Dutch current hour is labeled "Nu" (${chart.labels[0]})`);
    check(chart.description.startsWith("Nu: 0,6 mm regen"), `the Dutch screen reader description says "Nu" (${chart.description})`);
    check(chart.summary.startsWith("Nu regen verwacht (tot 2,6 mm per uur)."), `the Dutch summary says rain is expected now (${chart.summary})`);

    // 11:05 in Brussels: a re-render drops the past 10:00 hour and starts at the new current hour.
    await page.clock.setSystemTime(new Date("2026-10-28T10:05:00Z"));
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "en");
    chart = await readChart();
    check(chart.labels.length === 11 && chart.labels[0] === "Now" && chart.labels[1] === "12:00" && chart.nowClass.filter(Boolean).length === 1,
      `a re-rendered chart starts at the new current hour (${chart.labels.slice(0, 2).join(", ")})`);
    check(chart.summary.startsWith("Rain expected from 13:00"), `the summary leaves out the past hour (${chart.summary})`);

    // A dry current hour keeps the time of the first rain in the summary.
    await context.route("https://api.open-meteo.com/**", (route) => route.fulfill({ json: forecastBody() }));
    await page.clock.setSystemTime(new Date("2026-10-28T09:20:00Z"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");
    chart = await readChart();
    check(chart.labels[0] === "Now" && chart.summary.startsWith("Rain expected from 13:00"), `a dry current hour keeps the first rain time (${chart.summary})`);
    check(problems.length === 0, `no now-label console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 9: an offline start shows the last saved forecast while at least 6 of its hours lie ahead.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 }, timezoneId: "Europe/Brussels" });
  try {
    await mockOpenMeteo(context);
    const forecastUrls = [];
    let online = true;
    await context.route("https://api.open-meteo.com/**", (route) => {
      forecastUrls.push(route.request().url());
      return online ? route.fulfill({ json: dayForecastBody() }) : route.abort("internetdisconnected");
    });
    await page.clock.install({ time: MOCK_NOW });
    check((await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
      "offline-start scenario receives HTTP 200");
    await page.waitForSelector("#forecast:not(.hidden)");

    const start = async (minutesLater) => {
      await page.clock.setSystemTime(new Date(MOCK_NOW.getTime() + minutesLater * 60 * 1000));
      await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"));
      return page.evaluate(() => ({
        shown: !document.getElementById("forecast").classList.contains("hidden"),
        error: document.getElementById("start-error").classList.contains("hidden") ? "" : document.getElementById("start-error").textContent,
        labels: [...document.querySelectorAll("#forecast-chart .forecast-time")].map((label) => label.textContent),
        description: document.querySelector("#forecast-chart .sr-only")?.textContent || "",
        place: document.getElementById("forecast-place").textContent,
        updated: document.getElementById("forecast-updated").textContent,
      }));
    };
    online = false;
    let view = await start(30);
    await captureViews(page, "offline-start");
    check(new URL(forecastUrls[0]).searchParams.get("forecast_hours") === "25", "the forecast request asks for 25 hourly steps");
    check(forecastUrls.length === 2, "an offline start still tries to fetch the forecast");
    check(view.shown && !view.error && view.place.includes("Gent") && view.labels.length === 12
      && view.labels[0] === "Now" && view.labels[1] === "11:00",
      `an offline start shows the saved chart without an error (${view.error || view.labels.slice(0, 2).join(", ")})`);
    check(view.updated === "Updated at 10:20", `the saved chart keeps its original update time (${view.updated})`);

    view = await start(3 * 60);
    check(view.shown && !view.error && view.labels.length === 12 && view.labels[0] === "Now" && view.labels[1] === "14:00"
      && view.labels[11] === "00:00" && view.description.startsWith("Now: 0.4 mm rain"),
      `3 hours later the saved chart starts at 13:00 (${view.labels.slice(0, 2).join(", ")}, ${view.description})`);
    check(view.updated === "Updated at 10:20", `3 hours later the update time still reads 10:20 (${view.updated})`);

    view = await start(20 * 60);
    check(!view.shown && view.error.startsWith("The forecast service could not be reached"),
      `20 hours later the network error replaces the 4 remaining saved hours (${view.error})`);

    online = true;
    view = await start(3 * 60);
    check(view.shown && !view.error && view.updated === "Updated at 13:20", `a successful start replaces the saved forecast (${view.updated})`);

    // 06:20 the next day: a failed background refresh leaves 4 shown hours, too few to keep.
    const refresh = async (minutesLater) => {
      await page.clock.setSystemTime(new Date(MOCK_NOW.getTime() + minutesLater * 60 * 1000));
      await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await page.waitForTimeout(300);
      await page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"));
      return page.evaluate(() => ({
        shown: !document.getElementById("forecast").classList.contains("hidden"),
        error: !document.getElementById("start-error").classList.contains("hidden"),
      }));
    };
    online = false;
    let refreshed = await refresh(20 * 60);
    check(!refreshed.shown && refreshed.error, "a failed refresh with under 6 hours left hides the chart and shows the error");
    online = true;
    refreshed = await refresh(20 * 60 + 20);
    check(refreshed.shown && !refreshed.error, "the next refresh brings the chart back and clears the error");
    // The aborted forecast requests above are intentional; drop their network and console entries from the error gate.
    problems.splice(0, problems.length, ...problems.filter((p) => !p.includes("api.open-meteo.com") && !p.includes("ERR_INTERNET_DISCONNECTED")));
    check(problems.length === 0, `no offline-start console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 10: resuming the app drops past hours, whether its refresh fails or is skipped offline.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 }, timezoneId: "Europe/Brussels" });
  try {
    await mockOpenMeteo(context);
    const forecastUrls = [];
    let online = true;
    await context.route("https://api.open-meteo.com/**", (route) => {
      forecastUrls.push(route.request().url());
      return online ? route.fulfill({ json: dayForecastBody() }) : route.abort("internetdisconnected");
    });
    await page.clock.install({ time: MOCK_NOW });
    check((await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" })).status() === 200,
      "resume scenario receives HTTP 200");
    await page.waitForSelector("#forecast:not(.hidden)");

    const resume = async (minutesLater, event) => {
      await page.clock.setSystemTime(new Date(MOCK_NOW.getTime() + minutesLater * 60 * 1000));
      await page.evaluate((name) => {
        if (name === "pageshow") {
          window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
        }
        else {
          document.dispatchEvent(new Event("visibilitychange"));
        }
      }, event);
      await page.waitForTimeout(300);
      await page.waitForFunction(() => document.getElementById("forecast-status").classList.contains("hidden"));
      return page.evaluate(() => ({
        shown: !document.getElementById("forecast").classList.contains("hidden"),
        error: document.getElementById("start-error").classList.contains("hidden") ? "" : document.getElementById("start-error").textContent,
        labels: [...document.querySelectorAll("#forecast-chart .forecast-time")].map((label) => label.textContent),
        summary: document.getElementById("forecast-summary").textContent.trim(),
      }));
    };
    const failures = [];
    const expect = (condition, message) => {
      if (!condition) {
        failures.push(message);
      }
    };

    // 14:05: the refresh of the 10:20 forecast fails with 20 hours left.
    online = false;
    let view = await resume(225, "visibilitychange");
    expect(forecastUrls.length === 2, `a stale forecast tries to refresh (${forecastUrls.length} requests)`);
    expect(view.shown && !view.error && view.labels.length === 12 && view.labels[0] === "Now" && view.labels[1] === "15:00",
      `a failed refresh starts the chart at 14:00 (${view.error || view.labels.slice(0, 2).join(", ")})`);
    expect(view.summary.startsWith("Rain expected now"), `a failed refresh summarizes only the coming hours (${view.summary})`);

    // 16:05 offline: no refresh runs, but the chart still moves on.
    await context.setOffline(true);
    view = await resume(345, "pageshow");
    expect(forecastUrls.length === 2, `an offline resume skips the refresh (${forecastUrls.length} requests)`);
    expect(view.shown && !view.error && view.labels[0] === "Now" && view.labels[1] === "17:00",
      `an offline resume starts the chart at 16:00 (${view.error || view.labels.slice(0, 2).join(", ")})`);

    // 06:20 the next day, still offline: 4 hours are left, too few to keep.
    view = await resume(20 * 60, "visibilitychange");
    expect(!view.shown && view.error.startsWith("The forecast service could not be reached"),
      `an offline resume with under 6 hours left shows the network error (${view.shown ? view.labels.slice(0, 2).join(", ") : view.error})`);

    await context.setOffline(false);
    online = true;
    view = await resume(20 * 60 + 5, "visibilitychange");
    expect(view.shown && !view.error && forecastUrls.length === 3, `the first online resume fetches the forecast again (${view.error})`);
    check(failures.length === 0, `resuming drops past hours after a failed or skipped refresh${failures.length ? `:\n${failures.join("\n")}` : ""}`);
    // The aborted forecast requests above are intentional; drop their network and console entries from the error gate.
    problems.splice(0, problems.length, ...problems.filter((p) => !p.includes("api.open-meteo.com") && !p.includes("ERR_INTERNET_DISCONNECTED")));
    check(problems.length === 0, `no resume console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 11: a shown forecast hides the search row, and the footer button shows it again.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 } });
  try {
    await mockOpenMeteo(context);
    await page.clock.install({ time: MOCK_NOW });
    check((await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" })).status() === 200, "search row scenario receives HTTP 200");
    check(await page.isVisible("#location-form") && await page.isHidden("#btn-change-place"),
      "a start without a saved place shows the search row and no change place button");

    await page.fill("#location-input", "Gent");
    await page.click("#btn-search");
    await page.click("#place-choices li:first-child button");
    await page.waitForSelector("#forecast:not(.hidden)");
    check(await page.isHidden("#location-form"), "choosing a place hides the search row");
    check(await page.isVisible("#btn-change-place") && (await page.getAttribute("#btn-change-place", "aria-expanded")) === "false",
      "the change place button is shown, collapsed");
    check((await page.getAttribute("#btn-change-place", "aria-label")) === "Search another place", "the change place button has an English name");
    await captureViews(page, "search-row-hidden");

    await page.click("#btn-change-place");
    check(await page.isVisible("#location-form"), "the change place button shows the search row");
    check(await page.evaluate(() => document.activeElement.id) === "location-input", "showing the search row focuses the search field");
    check((await page.getAttribute("#btn-change-place", "aria-expanded")) === "true", "the change place button is expanded");
    await captureViews(page, "search-row-shown");
    await page.click("#btn-change-place");
    check(await page.isHidden("#location-form"), "the change place button hides the search row again");

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    check((await page.getAttribute("#btn-change-place", "aria-label")) === "Zoek een andere plaats", "the change place button has a Dutch name");
    check(await page.isHidden("#location-form"), "a language switch keeps the search row hidden");
    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "en");

    await page.goto(`${server.url}?lang=en`, { waitUntil: "networkidle" });
    await page.waitForSelector("#forecast:not(.hidden)");
    check(await page.isHidden("#location-form"), "a start with a saved place hides the search row");

    await page.click("#btn-about");
    check((await page.textContent("[data-i18n='about.icon_search_title']")) === "Search", "About lists the search icon");
    await page.click("#btn-about-back");
    check(problems.length === 0, `no search row console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
  }
  catch (err) {
    failed = true;
    console.error(err.message);
  }
  finally {
    await browser.close();
  }
}

// Scenario 12: a failed first forecast keeps the search row visible with the error.
{
  const { browser, context, page, problems } = await launchBrowser({ viewport: { width: 390, height: 844 } });
  try {
    await mockOpenMeteo(context);
    await context.route("https://api.open-meteo.com/**", (route) => route.fulfill({ status: 500, json: { error: true } }));
    await page.goto(`${server.url}?lang=en&location=Brussel`, { waitUntil: "networkidle" });
    await page.waitForSelector("#start-error:not(.hidden)");
    check(await page.isVisible("#location-form") && await page.isHidden("#btn-change-place"),
      "a failed first forecast keeps the search row and hides the change place button");
    // The mocked HTTP 500 forecast is intentional; drop its response and console entries from the error gate.
    problems.splice(0, problems.length, ...problems.filter((p) => !p.includes("api.open-meteo.com") && !p.includes("status of 500")));
    check(problems.length === 0, `no failed forecast console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
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
