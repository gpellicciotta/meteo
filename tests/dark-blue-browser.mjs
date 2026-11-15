// Verify dark-blue controls and capture the three screens before and after the palette change.
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { check, launchBrowser, startStaticServer } from "./browser-harness.mjs";

const server = await startStaticServer();
const { browser, page, problems } = await launchBrowser();
const captures = process.env.SCREENSHOT_DIR;
const controls = [];

try {
  check((await page.request.get(server.url)).status() === 200, "the local app returns HTTP 200");
  if (captures) {
    mkdirSync(captures, { recursive: true });
  }
  for (const width of [390, 1440]) {
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${server.url}?lang=en&theme=${theme}&theme-color=blue`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => document.querySelector("#btn-search").textContent === "Show");
      await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
      for (const screen of ["start", "config", "about"]) {
        if (screen !== "start") {
          await page.locator(screen === "config" ? "#btn-config" : "#btn-about").click();
        }
        if (screen === "about") {
          await page.waitForFunction(() => /^v\d/.test(document.querySelector("#about-version-tag").textContent));
        }
        check(await page.locator(`#screen-${screen}`).isVisible(), `${screen} renders at ${width}px in ${theme}`);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "no horizontal scrolling");
        await page.mouse.move(0, 0);
        if (captures) {
          await page.screenshot({ path: join(captures, `${screen}-${width}-${theme}.png`), fullPage: true });
        }
        if (screen === "config") {
          const button = page.locator("#btn-config-save");
          const colors = async () => button.evaluate((node) => {
            const style = getComputedStyle(node);
            return { fill: style.backgroundColor, text: style.color };
          });
          controls.push({ theme, state: "default", ...await colors() });
          await button.hover();
          controls.push({ theme, state: "hover", ...await colors() });
          await page.mouse.move(0, 0);
          await button.focus();
          await page.keyboard.press("Shift+Tab");
          await page.keyboard.press("Tab");
          check(await button.evaluate((node) => node.matches(":focus-visible")), "keyboard focus is visible");
          controls.push({ theme, state: "focus", ...await colors() });
          await page.locator("#btn-config-close").click();
        }
      }
    }
  }
  for (const { theme, state, fill, text } of controls) {
    const expectedFill = theme === "dark"
      ? (state === "default" ? "rgb(96, 165, 250)" : "rgb(147, 197, 253)")
      : (state === "default" ? "rgb(26, 86, 219)" : "rgb(22, 63, 158)");
    check(fill === expectedFill, `${theme} ${state} fill is ${fill}`);
    check(text === (theme === "dark" ? "rgb(15, 23, 42)" : "rgb(255, 255, 255)"), `${theme} ${state} label is ${text}`);
  }
  check(problems.length === 0, `no console, page or network errors: ${problems.join("; ")}`);
}
finally {
  await browser.close();
  await server.close();
}
