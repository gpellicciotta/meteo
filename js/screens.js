import { el } from "./dom.js";
import { loadChangelog } from "./changelog.js";

/**
 * Show one top-level screen and hide all the others.
 *
 * Lazily loads the changelog when the About screen becomes visible.
 *
 * @param {string} name - Screen key: "start", "about" or "config".
 * @returns {void}
 */
export function showScreen(name) {
  el.screenStart.classList.toggle("hidden", name !== "start");
  el.screenAbout.classList.toggle("hidden", name !== "about");
  el.screenConfig.classList.toggle("hidden", name !== "config");
  if (name === "about") {
    loadChangelog();
  }
}
