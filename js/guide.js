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

// Hover explanations need a mouse that can hover; touch screens use the badges and list only.
const HOVER_QUERY = window.matchMedia("(hover: hover) and (pointer: fine)");

// Gap between the tooltip and the hovered element, in pixels.
const TIP_GAP = 6;

const hover = { section: -1, anchor: null, tip: null };

/**
 * Find the guide section a node of the sample belongs to.
 *
 * @param {EventTarget|null} node - Node under the pointer.
 * @returns {{section: number, anchor: Element|null}} Index into BADGE_TARGETS and the hovered element,
 *          or -1 and null for gaps between sections.
 */
function sectionAt(node) {
  if (!(node instanceof Element) || !el.guideSample.contains(node)) {
    return { section: -1, anchor: null };
  }
  const badge = node.closest(".guide-badge");
  if (badge) {
    return { section: Number(badge.textContent) - 1, anchor: badge };
  }
  for (const [i, [selector]] of BADGE_TARGETS.entries()) {
    const anchor = node.closest(selector);
    if (anchor && el.guideSample.contains(anchor)) {
      return { section: i, anchor };
    }
  }
  return { section: -1, anchor: null };
}

/**
 * Place the tooltip above its element, or below it without room above, inside the sample's width.
 *
 * @param {Element} anchor - Hovered element.
 * @returns {void}
 */
function positionTip(anchor) {
  const tip = hover.tip;
  const box = el.guideSample.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  const left = (rect.left + rect.right) / 2 - box.left - tip.offsetWidth / 2;
  const above = rect.top - tip.offsetHeight - TIP_GAP;
  tip.style.left = `${Math.max(0, Math.min(left, box.width - tip.offsetWidth))}px`;
  tip.style.top = `${(above >= 0 ? above : rect.bottom + TIP_GAP) - box.top}px`;
}

/**
 * Show the explanation of a section next to the hovered element, highlighting the section and its list item.
 *
 * @param {number} section - Index into BADGE_TARGETS, or -1 to hide the explanation.
 * @param {Element|null} anchor - Hovered element of the section.
 * @returns {void}
 */
function showSection(section, anchor) {
  if (section === hover.section && anchor === hover.anchor) {
    return;
  }
  if (section !== hover.section) {
    document.querySelectorAll(".is-guide-active").forEach((node) => node.classList.remove("is-guide-active"));
  }
  Object.assign(hover, { section, anchor });
  if (section < 0) {
    hover.tip.classList.add("hidden");
    return;
  }
  const item = el.guideItems[section];
  el.guideSample.querySelectorAll(BADGE_TARGETS[section][0]).forEach((node) => node.classList.add("is-guide-active"));
  item.classList.add("is-guide-active");
  const [title, text] = hover.tip.children;
  title.textContent = `${section + 1}. ${item.querySelector(".guide-item-title").textContent.trim()}`;
  text.textContent = item.querySelector(".guide-item-text").textContent.trim();
  // The sky explanation refers to its icons, so the tooltip shows them too, by name only.
  const icons = item.querySelector(".guide-icons");
  hover.tip.querySelector(".guide-icons")?.remove();
  if (icons) {
    hover.tip.append(icons.cloneNode(true));
  }
  hover.tip.classList.remove("hidden");
  positionTip(anchor);
}

/**
 * Explain the hovered section of the sample with a tooltip, for mouse pointers on hover devices.
 *
 * @returns {void}
 */
function initHoverTips() {
  hover.tip = document.createElement("div");
  hover.tip.className = "guide-tip hidden";
  for (const className of ["guide-tip-title", "guide-tip-text"]) {
    const part = document.createElement("span");
    part.className = className;
    hover.tip.append(part);
  }
  el.guideSample.append(hover.tip);
  el.guideSample.addEventListener("pointermove", (e) => {
    if (e.pointerType === "mouse" && HOVER_QUERY.matches) {
      const { section, anchor } = sectionAt(e.target);
      showSection(section, anchor);
    }
  });
  el.guideSample.addEventListener("pointerleave", () => showSection(-1, null));
}

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
  // A re-render replaces the hovered cells, so the next pointer move shows the explanation again.
  showSection(-1, null);
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
  initHoverTips();
  renderGuide();
  document.addEventListener("languagechange", renderGuide);
  document.addEventListener("settingschange", renderGuide);
  // The About view starts hidden, so the badges are placed once it is shown and whenever it resizes.
  new ResizeObserver(positionBadges).observe(el.guideSample);
}
