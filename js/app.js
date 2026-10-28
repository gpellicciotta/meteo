import { el } from "./dom.js";
import { initTheme } from "./theme.js";
import { applyStoredPreferences } from "./preferences.js";
import { showScreen } from "./screens.js";
import { openConfigView, closeConfigView, saveConfig, previewTheme } from "./config-view.js";
import { loadChangelog } from "./changelog.js";
import { registerServiceWorker, updateOnlineStatus, syncInstallButtonState } from "./pwa.js";
import { setLang, detectLang, getLang, applyAll, t, SUPPORTED_LANGS } from "./i18n.js";
import { renderDataIcons } from "./icons.js";

/**
 * Replace every [data-icon] placeholder in the document with its SVG icon.
 *
 * @returns {void}
 */
function hydrateAppIcons() {
  renderDataIcons(document);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", hydrateAppIcons, { once: true });
}
else {
  hydrateAppIcons();
}

el.btnAbout.addEventListener("click", () => showScreen("about"));
el.btnAboutBack.addEventListener("click", () => showScreen("start"));
el.btnConfig.addEventListener("click", openConfigView);
el.btnConfigClose.addEventListener("click", closeConfigView);
el.btnConfigSave.addEventListener("click", saveConfig);
el.configTheme.addEventListener("change", previewTheme);
el.configThemeColor.addEventListener("change", previewTheme);

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") {
    return;
  }
  if (!el.screenConfig.classList.contains("hidden")) {
    closeConfigView();
  }
  else if (!el.screenAbout.classList.contains("hidden")) {
    showScreen("start");
  }
});

/**
 * Act on the query string parameters that open a given view directly.
 *
 * @returns {void}
 */
function checkAutoStart() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("install") === "1" || params.get("pwa") === "1") {
    el.btnInstall.classList.remove("hidden");
    syncInstallButtonState();
  }
  if (params.get("modal") === "config" || params.get("config") === "1") {
    openConfigView();
  }
  else if (params.get("view") === "about" || params.has("about")) {
    showScreen("about");
  }
}

// ── Language switcher ─────────────────────────────────────────────────────────

/**
 * Build the language cycle label shown in the language button tooltip.
 *
 * Brackets the active language, since the CSS tooltip renders plain text and cannot bold it.
 *
 * @param {string} lang - Active language code.
 * @returns {string} Label listing every language in cycle order, such as "[EN] → NL".
 */
function buildLangCycleLabel(lang) {
  return SUPPORTED_LANGS.map((code) => {
    const upper = code.toUpperCase();
    return code === lang ? `[${upper}]` : upper;
  }).join(" → ");
}

/**
 * Refresh the language button's label, tooltip and accessible name.
 *
 * @returns {void}
 */
function updateLangButton() {
  const lang = getLang();
  el.btnLang.querySelector(".btn-lang-label").textContent = lang.toUpperCase();
  const tooltip = t("start.btn_lang_tooltip", { cycle: buildLangCycleLabel(lang) });
  el.btnLang.setAttribute("aria-label", t("start.btn_lang_aria"));
  el.btnLang.setAttribute("data-tooltip", tooltip);
  el.btnLang.setAttribute("title", tooltip);
}

el.btnLang.addEventListener("click", () => {
  const index = SUPPORTED_LANGS.indexOf(getLang());
  setLang(SUPPORTED_LANGS[(index + 1) % SUPPORTED_LANGS.length]).catch((err) => console.warn(err));
});

// Re-render all dynamic strings on language change (covers module-local renders)
document.addEventListener("languagechange", () => {
  applyAll();
  updateLangButton();
  if (!el.screenAbout.classList.contains("hidden")) {
    loadChangelog();
  }
});

/**
 * Hide any tooltip that is open at the moment the layout changes.
 *
 * A tap-focused or touch-hover tooltip would otherwise keep showing, mispositioned,
 * after a resize or orientation change.
 *
 * @returns {void}
 */
function dismissOpenTooltips() {
  if (document.activeElement instanceof HTMLElement && document.activeElement.hasAttribute("data-tooltip")) {
    document.activeElement.blur();
  }
  document.body.classList.add("suppress-tooltips");
  window.requestAnimationFrame(() => {
    document.body.classList.remove("suppress-tooltips");
  });
}
window.addEventListener("resize", dismissOpenTooltips);
window.addEventListener("orientationchange", dismissOpenTooltips);

// ── Application startup ───────────────────────────────────────────────────────
registerServiceWorker();
syncInstallButtonState();
setLang(detectLang())
  .then(() => {
    initTheme();
    applyStoredPreferences();
    updateOnlineStatus();
    syncInstallButtonState();
    checkAutoStart();
  })
  .catch((err) => {
    console.error(err);
    el.startError.textContent = "The interface texts could not be loaded. Please reload the page.";
    el.startError.classList.remove("hidden");
  });
