import { el } from "./dom.js";
import { t, getLang } from "./i18n.js";

let changelogHtmlCache = null;
let changelogHtmlCacheLang = null;

/**
 * Resolve the changelog file name for a UI language.
 *
 * @param {string} lang - Language code; Dutch uses the untranslated file.
 * @returns {string} Relative path of the changelog to fetch.
 */
function changelogPathForLang(lang) {
  return lang && lang !== "nl" ? `CHANGELOG.${lang}.md` : "CHANGELOG.md";
}

/**
 * Escape the characters that carry meaning in HTML.
 *
 * @param {*} str - Value to escape; converted to a string first.
 * @returns {string} Text safe to insert into markup.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Render the inline markdown used in changelog bullets.
 *
 * Supports code spans, bold text and links; everything else is escaped.
 *
 * @param {string} text - Raw markdown fragment.
 * @returns {string} HTML fragment.
 */
function formatInlineMarkdown(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return s;
}

/**
 * Render a changelog document as the HTML shown in the About screen and modal.
 *
 * Version headings become subtitles, bullets become list items with an area badge
 * when they start with an area prefix, and the title, rules and quotes are dropped.
 *
 * @param {string} md - Full changelog markdown.
 * @returns {string} HTML fragment.
 */
function renderChangelogMarkdown(md) {
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;

  /**
   * Close the open bullet list, if any.
   *
   * @returns {void}
   */
  function closeList() {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line || line === "---") {
      closeList();
      continue;
    }

    if (line.startsWith("# ")) {
      closeList();
      continue;
    }

    if (line.startsWith(">")) {
      closeList();
      continue;
    }

    if (line.startsWith("## ")) {
      closeList();
      const title = escapeHtml(line.slice(3).trim());
      html += `<h4 class="changelog-version-title">${title}</h4>`;
      continue;
    }

    if (line.startsWith("- ")) {
      if (!inList) {
        html += '<ul class="changelog-list">';
        inList = true;
      }
      const content = line.slice(2).trim();
      const match = content.match(/^([A-Za-z]+):\s*(.*)$/);
      if (match) {
        const area = escapeHtml(match[1]);
        const desc = formatInlineMarkdown(match[2]);
        html += `<li><span class="changelog-badge changelog-badge-${area.toLowerCase()}">${area}</span> ${desc}</li>`;
      } else {
        html += `<li>${formatInlineMarkdown(content)}</li>`;
      }
      continue;
    }

    closeList();
    html += `<p class="changelog-p">${formatInlineMarkdown(line)}</p>`;
  }

  closeList();
  return html;
}

/**
 * Read the current version from the first version heading in the changelog.
 *
 * @param {string} md - Full changelog markdown.
 * @returns {string} Version string, or "onbekend" when no heading was found.
 */
function extractVersionFromChangelog(md) {
  const match = md.match(/^##\s+([^\s\[]+)/m);
  return match ? match[1] : "onbekend";
}

/**
 * Load, render and display the changelog for the active language.
 *
 * The rendered HTML is cached per language. A missing translation falls back to the
 * Dutch changelog, and a failed load shows an error with a direct file link. The
 * version badge on the About screen and the version button are updated as well.
 *
 * @returns {Promise<void>} Resolves once the changelog or an error message is shown.
 */
export async function loadChangelog() {
  const lang = getLang();
  if (changelogHtmlCache && changelogHtmlCacheLang === lang) {
    if (el.changelogBody) el.changelogBody.innerHTML = changelogHtmlCache;
    if (el.aboutChangelogBody) el.aboutChangelogBody.innerHTML = changelogHtmlCache;
    return;
  }
  const loadingHtml = `<p class="changelog-loading">${t("changelog.loading")}</p>`;
  if (el.changelogBody) el.changelogBody.innerHTML = loadingHtml;
  if (el.aboutChangelogBody) el.aboutChangelogBody.innerHTML = loadingHtml;
  try {
    let res = await fetch(changelogPathForLang(lang));
    if (!res.ok && lang !== "nl") {
      res = await fetch("CHANGELOG.md");
    }
    if (!res.ok) throw new Error("Failed to load CHANGELOG.md: " + res.status);
    const md = await res.text();
    const version = extractVersionFromChangelog(md);
    if (el.aboutVersionTag) el.aboutVersionTag.textContent = version;
    if (el.btnVersion) el.btnVersion.textContent = version;
    changelogHtmlCache = renderChangelogMarkdown(md);
    changelogHtmlCacheLang = lang;
    if (el.changelogBody) el.changelogBody.innerHTML = changelogHtmlCache;
    if (el.aboutChangelogBody) el.aboutChangelogBody.innerHTML = changelogHtmlCache;
  } catch (err) {
    console.warn("Failed to load changelog:", err);
    changelogHtmlCache = null;
    changelogHtmlCacheLang = null;
    if (el.aboutVersionTag) el.aboutVersionTag.textContent = t("version.unknown");
    if (el.btnVersion) el.btnVersion.textContent = t("version.unknown");
    const errHtml = `
      <p class="error">${t("changelog.error")}</p>
      <p class="modal-desc">${t("changelog.error_link").replace("CHANGELOG.md", '<a href="CHANGELOG.md" target="_blank" rel="noopener noreferrer">CHANGELOG.md</a>')}</p>
    `;
    if (el.changelogBody) el.changelogBody.innerHTML = errHtml;
    if (el.aboutChangelogBody) el.aboutChangelogBody.innerHTML = errHtml;
  }
}

/**
 * Open the changelog modal, load its content and focus the close button.
 *
 * @returns {void}
 */
export function openChangelogModal() {
  if (!el.modalChangelog) return;
  el.modalChangelog.classList.remove("hidden");
  loadChangelog();
  if (el.btnChangelogClose) el.btnChangelogClose.focus();
}

/**
 * Close the changelog modal and return focus to the version button.
 *
 * @returns {void}
 */
export function closeChangelogModal() {
  if (!el.modalChangelog) return;
  el.modalChangelog.classList.add("hidden");
  if (el.btnVersion) el.btnVersion.focus();
}
