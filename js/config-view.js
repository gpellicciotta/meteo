import { el } from "./dom.js";
import { getStoredPreferences, setStoredPreferences } from "./preferences.js";
import { showScreen } from "./screens.js";
import { applyTheme } from "./theme.js";
import { getLang, setLang, SUPPORTED_LANGS } from "./i18n.js";
import { displaySettings } from "./forecast.js";
import { activeUnits, storedUnits } from "./units.js";

let initialThemeSetting = "system";
let initialThemeColor = "blue";
// True once a unit select changed during this visit of the settings view.
let unitsTouched = false;

/**
 * Remember that the user chose a unit, so saving stores the units even when they stay metric.
 *
 * @returns {void}
 */
export function touchUnits() {
  unitsTouched = true;
}

/**
 * Preview theme and accent color changes immediately.
 *
 * @returns {void}
 */
export function previewTheme() {
  const themeSetting = el.configTheme.value || "system";
  const themeColor = el.configThemeColor.value || "blue";
  applyTheme(themeSetting, themeColor);
}

/**
 * Open the settings view with all fields prepopulated from the current state.
 *
 * @returns {void}
 */
export function openConfigView() {
  initialThemeSetting = document.documentElement.getAttribute("data-theme-setting") || "system";
  initialThemeColor = document.documentElement.getAttribute("data-theme-color") || "blue";
  el.configLanguage.value = getLang();
  el.configTheme.value = initialThemeSetting;
  el.configThemeColor.value = initialThemeColor;
  const prefs = getStoredPreferences();
  const settings = displaySettings(prefs);
  el.configShowWind.checked = settings.showWind;
  el.configShowConditions.checked = settings.showConditions;
  const units = activeUnits(prefs);
  el.configUnitTemperature.value = units.temperature;
  el.configUnitPrecipitation.value = units.precipitation;
  el.configUnitWind.value = units.wind;
  unitsTouched = false;
  showScreen("config");
}

/**
 * Leave the settings view without saving, reverting any uncommitted theme preview.
 *
 * @returns {void}
 */
export function closeConfigView() {
  applyTheme(initialThemeSetting, initialThemeColor);
  el.configTheme.value = initialThemeSetting;
  el.configThemeColor.value = initialThemeColor;
  showScreen("start");
}

/**
 * Apply the settings form, persist it and return to the start view.
 *
 * A changed language is loaded afterwards; the "languagechange" event re-renders the strings.
 * A "settingschange" event lets the forecast view apply the display settings.
 * Units are only stored once set before or chosen now, so a theme-only save keeps their prefill open.
 *
 * @returns {void}
 */
export function saveConfig() {
  const newLang = el.configLanguage.value;
  const languageChanged = SUPPORTED_LANGS.includes(newLang) && newLang !== getLang();

  const themeSetting = el.configTheme.value || "system";
  const themeColor = el.configThemeColor.value || "blue";
  applyTheme(themeSetting, themeColor);
  initialThemeSetting = themeSetting;
  initialThemeColor = themeColor;

  const patch = {
    theme: themeSetting,
    themeColor,
    showWind: el.configShowWind.checked,
    showConditions: el.configShowConditions.checked,
  };
  if (unitsTouched || storedUnits(getStoredPreferences())) {
    patch.units = {
      temperature: el.configUnitTemperature.value,
      precipitation: el.configUnitPrecipitation.value,
      wind: el.configUnitWind.value,
    };
  }
  setStoredPreferences(patch);
  closeConfigView();
  document.dispatchEvent(new Event("settingschange"));

  if (languageChanged) {
    setLang(newLang).catch((err) => console.warn(err));
  }
}
