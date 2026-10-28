import { el } from "./dom.js";
import { setStoredPreferences } from "./preferences.js";
import { showScreen } from "./screens.js";
import { applyTheme } from "./theme.js";
import { getLang, setLang, SUPPORTED_LANGS } from "./i18n.js";

let initialThemeSetting = "system";
let initialThemeColor = "blue";

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

  setStoredPreferences({ theme: themeSetting, themeColor });
  closeConfigView();

  if (languageChanged) {
    setLang(newLang).catch((err) => console.warn(err));
  }
}
