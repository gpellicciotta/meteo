import { el } from "./dom.js";
import { getLang, t } from "./i18n.js";
import { renderChart, renderSummary, unitLabel } from "./forecast-view.js";
import { MIN_SCALE_MM, RAIN_THRESHOLD_MM, STRONG_GUST_THRESHOLD_KMH } from "./forecast.js";
import { guideHours } from "./guide-sample.js";
import { getStoredPreferences } from "./preferences.js";
import { activeUnits, convertValue } from "./units.js";

// Every optional part of the card is on in the guide, whatever the settings.
const GUIDE_OPTIONS = { showWind: true, showConditions: true };

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
  const units = activeUnits(getStoredPreferences());
  const settings = { ...GUIDE_OPTIONS, units };
  // Two significant digits keep small thresholds readable, such as 0.0039 in instead of <0.01 in.
  const threshold = new Intl.NumberFormat(getLang(), { maximumSignificantDigits: 2 });
  const amount = (kind, value) => `${threshold.format(convertValue(kind, value, units[kind]))} ${unitLabel(kind, units)}`;
  const vars = {
    gust: amount("wind", STRONG_GUST_THRESHOLD_KMH),
    wet: amount("precipitation", RAIN_THRESHOLD_MM),
    scale: amount("precipitation", MIN_SCALE_MM),
    rain_unit: unitLabel("precipitation", units),
    temp_unit: unitLabel("temperature", units),
    wind_unit: unitLabel("wind", units),
  };
  for (const text of el.guideTexts) {
    text.textContent = t(text.dataset.guideText, vars);
  }
  renderSummary(el.guideSummary, hours, true, settings);
  renderChart(el.guideChart, hours, true, settings);
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
  document.addEventListener("settingschange", renderGuide);
  // The About view starts hidden, so the badges are placed once it is shown and whenever it resizes.
  new ResizeObserver(positionBadges).observe(el.guideSample);
}
