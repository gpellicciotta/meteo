// Browser check of the forecast view against mocked Open-Meteo responses.
// Usage: node tests/forecast-browser.mjs   (set SCREENSHOT_DIR to save screenshots)
import { captureViews, check, launchBrowser, startStaticServer } from "./browser-harness.mjs";

const RAIN = [0, 0, 0, 0.05, 0.4, 1.2, 2.6, 0.3, 0, 0, 0, 0.1, 0];
const PLACES = [
  { id: 2797656, name: "Gent", admin1: "Flanders", country: "Belgium", latitude: 51.05, longitude: 3.71667 },
  { id: 2797657, name: "Gent", admin1: "Gelderland", country: "Netherlands", latitude: 51.8, longitude: 5.7 },
];

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
    const name = new URL(route.request().url()).searchParams.get("name");
    const results = name.toLowerCase() === "gent" ? PLACES : name.toLowerCase() === "brussel" ? [PLACES[0]] : undefined;
    route.fulfill({ json: results ? { results } : { generationtime_ms: 0.1 } });
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
    const label = await page.getAttribute("#forecast-chart > li:nth-child(5)", "aria-label");
    check(label === "14:00: 1.2 mm rain, 70% chance, 12 °C", `bars carry an accessible description (${label})`);
    check(urls.some((u) => u.includes("latitude=51.05") && u.includes("forecast_hours=13")), "the forecast request uses the picked place");
    check(await page.isVisible("#forecast a[href='https://open-meteo.com/']"), "the Open-Meteo attribution is shown");
    await captureViews(page, "forecast-en");

    await page.click("#btn-lang");
    await page.waitForFunction(() => document.documentElement.lang === "nl");
    check((await page.textContent("#forecast-summary")).includes("Regen verwacht"), "the forecast re-renders in Dutch");
    await captureViews(page, "forecast-nl");

    await page.fill("#location-input", "Xyzzy");
    await page.click("#btn-search");
    await page.waitForSelector("#start-error:not(.hidden)");
    check((await page.textContent("#start-error")).includes("Xyzzy"), "an unknown place shows an error naming it");

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

await server.close();
process.exit(failed ? 1 : 0);
