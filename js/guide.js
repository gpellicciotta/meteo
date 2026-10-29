import { el } from "./dom.js";
import { t } from "./i18n.js";
import { renderChart, renderSummary } from "./forecast-view.js";
import { guideHours } from "./guide-sample.js";

// Every optional part of the card is on in the guide, whatever the settings.
const GUIDE_SETTINGS = { showWind: true, showConditions: true };

// Column of the wettest sample hour, and of the last hour, whose cells the badges point at.
const WETTEST_COLUMN = 5;
const LAST_COLUMN = 11;

// Badge targets in list order: [selector, column], where a null column searches the whole sample.
const BADGE_TARGETS = [
  [".forecast-summary", null],
  [".forecast-amount", WETTEST_COLUMN],
  [".forecast-bar-track", WETTEST_COLUMN],
  [".forecast-chance", LAST_COLUMN],
  [".forecast-time", 0],
  [".forecast-sky", LAST_COLUMN],
  [".forecast-temp", 0],
  [".forecast-wind", LAST_COLUMN],
  [".guide-place", null],
  [".guide-updated", null],
];

/**
 * Center each numbered badge vertically on its element of the sample card.
 *
 * Odd numbers sit in the left gutter and even numbers in the right one, so neighboring rows never collide.
 *
 * @returns {void}
 */
function positionBadges() {
  const sample = el.guideSample;
  const top = sample.getBoundingClientRect().top;
  const columns = sample.querySelectorAll(".forecast-chart > li");
  sample.querySelectorAll(".guide-badge").forEach((badge, i) => {
    const [selector, column] = BADGE_TARGETS[i];
    const scope = column === null ? sample : columns[column];
    const target = scope && scope.querySelector(selector);
    if (!target) {
      return;
    }
    const rect = target.getBoundingClientRect();
    badge.style.top = `${(rect.top + rect.bottom) / 2 - top - badge.offsetHeight / 2}px`;
  });
}

/**
 * Render the sample card of the guide in the active language.
 *
 * @returns {void}
 */
export function renderGuide() {
  const hours = guideHours();
  renderSummary(el.guideSummary, hours, true, GUIDE_SETTINGS);
  renderChart(el.guideChart, hours, true, GUIDE_SETTINGS);
  el.guidePlace.textContent = t("about.guide_place");
  el.guideUpdated.textContent = t("forecast.updated", { time: "10:20" });
  positionBadges();
}

/**
 * Add the numbered badges to the guide sample, and keep the sample rendered and its badges in place.
 *
 * @returns {void}
 */
export function initGuide() {
  el.guideSample.append(...BADGE_TARGETS.map((_, i) => {
    const badge = document.createElement("span");
    badge.className = `guide-badge ${i % 2 === 0 ? "is-left" : "is-right"}`;
    badge.textContent = String(i + 1);
    return badge;
  }));
  renderGuide();
  document.addEventListener("languagechange", renderGuide);
  // The About view starts hidden, so the badges are placed once it is shown and whenever it resizes.
  new ResizeObserver(positionBadges).observe(el.guideSample);
}
