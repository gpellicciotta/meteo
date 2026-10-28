// Browser check of the application shell: start, Settings and About views.
// Usage: node tests/shell-browser.mjs   (set SCREENSHOT_DIR to save screenshots)
import { captureViews, check, launchBrowser, startStaticServer } from "./browser-harness.mjs";

const server = await startStaticServer();
const { browser, page, problems } = await launchBrowser({ viewport: { width: 1280, height: 800 } });
let failed = false;

try {
  await page.goto(`${server.url}?lang=nl`, { waitUntil: "networkidle" });
  check((await page.textContent("#start-title")) === "Meteo", "start view shows the Meteo title");
  check((await page.getAttribute("html", "lang")) === "nl", "Dutch is active with ?lang=nl");
  await captureViews(page, "start");

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

  check(problems.length === 0, `no console, page or network errors${problems.length ? `:\n${problems.join("\n")}` : ""}`);
}
catch (err) {
  failed = true;
  console.error(err.message);
}
finally {
  await browser.close();
  await server.close();
}

process.exit(failed ? 1 : 0);
