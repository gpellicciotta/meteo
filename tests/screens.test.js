// @vitest-environment happy-dom
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCREENS = ["start", "about", "config"];

vi.mock("../js/changelog.js", () => ({ loadChangelog: vi.fn() }));

let screens;
let changelog;

/**
 * List the screen parts of one area of the shell.
 *
 * @param {string} area - Selector of a shell area, such as ".app__main".
 * @returns {HTMLElement[]} Elements inside the area that carry data-screen.
 */
function parts(area) {
  return [...document.querySelectorAll(`${area} [data-screen]`)];
}

beforeAll(async () => {
  // The real page, so the test covers the markup that the toggle code reads; links and scripts stay unloaded.
  const html = readFileSync(join(ROOT, "index.html"), "utf-8").replace(/<link[^>]*>|<script[\s\S]*?<\/script>/g, "");
  document.documentElement.innerHTML = html.replace(/^[\s\S]*?<html[^>]*>/, "").replace(/<\/html>[\s\S]*$/, "");
  screens = await import("../js/screens.js");
  changelog = await import("../js/changelog.js");
});

beforeEach(() => {
  window.scrollTo = vi.fn();
  changelog.loadChangelog.mockClear();
});

describe("shell screen parts", () => {
  it("give every screen a section in the main area, a title in the top bar, and a group in the action bar", () => {
    for (const area of [".app__main", ".app__top-bar", ".app__action-bar"]) {
      expect(parts(area).map((part) => part.dataset.screen).filter((name, i, all) => all.indexOf(name) === i).sort(), area)
        .toEqual([...SCREENS].sort());
    }
  });

  it("put the About and Settings close buttons in the top bar actions", () => {
    expect(parts(".app__top-actions").map((part) => part.id).sort()).toEqual(["btn-about-back", "btn-config-close"]);
  });
});

describe("showScreen", () => {
  it.each(SCREENS)("shows only the %s parts in every shell area", (name) => {
    screens.showScreen(name);
    const all = [...document.querySelectorAll("[data-screen]")];
    expect(all.length).toBeGreaterThan(9);
    expect(all.filter((part) => part.classList.contains("hidden") === (part.dataset.screen === name)).map((part) => part.outerHTML.slice(0, 60)))
      .toEqual([]);
    expect(screens.currentScreen()).toBe(name);
  });

  it("scrolls the page back to the top, since the document is the scroll container", () => {
    screens.showScreen("about");
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("loads the changelog only when the About screen opens", () => {
    screens.showScreen("config");
    expect(changelog.loadChangelog).not.toHaveBeenCalled();
    screens.showScreen("about");
    expect(changelog.loadChangelog).toHaveBeenCalledTimes(1);
  });
});
