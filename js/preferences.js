import { getThemeQueryOverride, getThemeColorQueryOverride } from "./params.js";
import { applyTheme } from "./theme.js";

export const PREFS_STORAGE_KEY = "meteo_preferences";

/**
 * Read the persisted user preferences from localStorage.
 *
 * @returns {Object} Stored preferences, or an empty object when nothing is stored
 *          or the value cannot be parsed.
 */
export function getStoredPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }
  catch (err) {
    console.warn("Failed to read preferences from localStorage:", err);
    return {};
  }
}

/**
 * Merge a partial preferences object into the persisted preferences.
 *
 * Storage failures are logged and swallowed so the UI keeps working in private mode.
 *
 * @param {Object} patch - Preference keys to add or overwrite.
 * @returns {void}
 */
export function setStoredPreferences(patch) {
  try {
    const prefs = getStoredPreferences();
    Object.assign(prefs, patch);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
  }
  catch (err) {
    console.warn("Failed to save preferences to localStorage:", err);
  }
}

/**
 * Apply the persisted theme preferences.
 *
 * Query string parameters take precedence, so a stored value is only applied when
 * the matching URL override is absent.
 *
 * @returns {void}
 */
export function applyStoredPreferences() {
  const stored = getStoredPreferences();
  const themeOverride = getThemeQueryOverride();
  const themeColorOverride = getThemeColorQueryOverride();
  if ((themeOverride === null && stored.theme) || (themeColorOverride === null && stored.themeColor)) {
    applyTheme(themeOverride || stored.theme, themeColorOverride || stored.themeColor);
  }
}
