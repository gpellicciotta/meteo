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

  // A listener added after the app's own one sees whether the app prevented the browser's help.
  await page.evaluate(() => document.addEventListener("keydown", (e) => {
    window.f1Prevented = e.key === "F1" ? e.defaultPrevented : window.f1Prevented;
  }));
  await page.keyboard.press("F1");
  check(await page.isVisible("#screen-about") && await page.isHidden("#screen-start"), "F1 opens the About view from the start view");
  check(await page.evaluate(() => window.f1Prevented === true), "F1 prevents the browser's own help");
  await page.evaluate(() => {
    document.querySelector(".about-content").scrollTop = 400;
  });
  await page.keyboard.press("F1");
  check(await page.isVisible("#screen-about") && await page.evaluate(() => document.querySelector(".about-content").scrollTop === 0),
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

await server.close();
process.exit(failed ? 1 : 0);
