/**
 * Lightweight i18n module.
 *
 * Supported languages: "nl" (default), "fr", "de", "it", "en".
 *
 * Usage:
 *   import { t, getLang, setLang, SUPPORTED_LANGS } from "./i18n.js";
 *   await setLang("it");          // load strings, update DOM, fire event
 *   t("quiz.progress", { n: 3, total: 20 });  // → "Frage 3/20"
 */

export const SUPPORTED_LANGS = ["nl", "fr", "de", "it", "en"];
let currentLang = "nl";
let dict = {};

/**
 * Substitute {name} placeholders in a string.
 *
 * @param {string} str - Template containing {name} placeholders.
 * @param {Record<string, string|number>} vars - Values to substitute by placeholder name.
 * @returns {string} String with every known placeholder replaced; unknown ones are left intact.
 */
function substitute(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

/**
 * Translate a key, optionally substituting variables.
 * Falls back to the key itself so missing translations are visible.
 *
 * @param {string} key - Dictionary key to look up.
 * @param {Record<string, string|number>} [vars] - Values for {name} placeholders in the string.
 * @returns {string} Translated text, or the key when it is not in the dictionary.
 */
export function t(key, vars = {}) {
  const str = key in dict ? dict[key] : key;
  return Object.keys(vars).length ? substitute(str, vars) : str;
}

/**
 * Return the active language code.
 *
 * @returns {string} Currently loaded language code.
 */
export function getLang() {
  return currentLang;
}

/**
 * Detect the preferred language from URL param → localStorage → default "nl".
 * @returns {"nl"|"fr"|"de"|"it"|"en"}
 */
export function detectLang() {
  try {
    const param = new URLSearchParams(window.location.search).get("lang");
    if (param && SUPPORTED_LANGS.includes(param.toLowerCase())) return param.toLowerCase();
    const stored = localStorage.getItem("lang");
    if (stored && SUPPORTED_LANGS.includes(stored.toLowerCase())) return stored.toLowerCase();
  } catch (_) {
    // localStorage may be unavailable
  }
  return "nl";
}

/**
 * Load the string dictionary for `lang`, apply it to the DOM, and fire
 * a custom "languagechange" event so modules can re-render dynamic strings.
 *
 * @param {string} lang - Language code to load; unsupported values fall back to "nl".
 * @returns {Promise<void>} Resolves once the dictionary is loaded and applied.
 * @throws {Error} When the dictionary for the language cannot be fetched.
 */
export async function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = "nl";
  const res = await fetch(`data/strings.${lang}.json`);
  if (!res.ok) throw new Error(`Could not load strings for language: ${lang}`);
  dict = await res.json();
  currentLang = lang;
  try {
    localStorage.setItem("lang", lang);
  } catch (_) {}
  document.documentElement.lang = lang;
  applyAll();
  document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
}

/**
 * Set the text of all [data-i18n] elements from the loaded dictionary.
 * Elements with [data-i18n-html] have their innerHTML set instead (for
 * strings that contain safe, controlled HTML such as <kbd> tags).
 *
 * Also fills aria-label, tooltip and placeholder attributes from their
 * data-i18n-aria, data-i18n-tooltip and data-i18n-placeholder keys.
 *
 * @returns {void}
 */
export function applyAll() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const str = t(key);
    if (el.hasAttribute("data-i18n-html")) {
      el.innerHTML = str;
    } else {
      el.textContent = str;
    }
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
  });
  document.querySelectorAll("[data-i18n-tooltip]").forEach((el) => {
    const val = t(el.getAttribute("data-i18n-tooltip"));
    el.setAttribute("data-tooltip", val);
    el.setAttribute("title", val);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}

