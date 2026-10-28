/**
 * Read the theme from the query string, falling back to the system theme.
 *
 * @returns {string} "light", "dark" or "system".
 */
export function getThemeParam() {
  return getThemeQueryOverride() || "system";
}

/**
 * Read the accent color from the query string, falling back to blue.
 *
 * @returns {string} "blue", "yellow" or "red".
 */
export function getThemeColorParam() {
  return getThemeColorQueryOverride() || "blue";
}

/**
 * Read the theme from the query string without applying a default.
 *
 * Used to decide whether the URL overrides the stored preference.
 *
 * @returns {string|null} "light", "dark" or "system", or null when absent or invalid.
 */
export function getThemeQueryOverride() {
  if (typeof window === "undefined" || !window.location) return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("theme");
  if (!raw) return null;
  const val = raw.trim().toLowerCase();
  return val === "dark" || val === "light" || val === "system" ? val : null;
}

/**
 * Read the accent color from the query string without applying a default.
 *
 * Accepts the "theme-color", "themecolor" and "theme_color" parameter names with
 * Dutch and English values. Used to decide whether the URL overrides the stored preference.
 *
 * @returns {string|null} "blue", "yellow" or "red", or null when absent or invalid.
 */
export function getThemeColorQueryOverride() {
  if (typeof window === "undefined" || !window.location) return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("theme-color") || params.get("themecolor") || params.get("theme_color");
  if (!raw) return null;
  const val = raw.trim().toLowerCase();
  if (val === "yellow" || val === "geel") return "yellow";
  if (val === "red" || val === "rood") return "red";
  if (val === "blue" || val === "blauw") return "blue";
  return null;
}
