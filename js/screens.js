import { loadChangelog } from "./changelog.js";

/**
 * Show one top-level screen and hide all the others.
 *
 * Every part of a screen carries data-screen: its section in the main area, its title and
 * close button in the top bar, and its group in the action bar. The page itself scrolls in
 * the shell, so a new screen starts at the top. Lazily loads the changelog for the About screen.
 *
 * @param {string} name - Screen key: "start", "about" or "config".
 * @returns {void}
 */
export function showScreen(name) {
  for (const part of document.querySelectorAll("[data-screen]")) {
    part.classList.toggle("hidden", part.dataset.screen !== name);
  }
  window.scrollTo(0, 0);
  if (name === "about") {
    loadChangelog();
  }
}

/**
 * Name the screen whose section is shown in the main area.
 *
 * @returns {string} Screen key: "start", "about" or "config".
 */
export function currentScreen() {
  return document.querySelector(".app__main > section[data-screen]:not(.hidden)")?.dataset.screen ?? "start";
}
