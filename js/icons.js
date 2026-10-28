const ICON_DEFS = {
  // Checkmark for correct answers and completed states.
  check: `
    <polyline points="20 6 9 17 4 12"></polyline>
  `,
  // X mark for closing controls and incorrect answers.
  close: `
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  `,
  // Outward arrow from a box for external links.
  externalLink: `
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  `,
  // Right-pointing triangle for play controls.
  play: `
    <polygon points="8 5 19 12 8 19 8 5"></polygon>
  `,
  // Two vertical bars for pause controls.
  pause: `
    <rect x="6" y="5" width="4" height="14" rx="1"></rect>
    <rect x="14" y="5" width="4" height="14" rx="1"></rect>
  `,
  // Circled information marker for about controls.
  info: `
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  `,
  // Question mark for help and about controls.
  help: `
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  `,
  // Gear for configuration and settings controls.
  settings: `
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0 .33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  `,
  // Bar chart icon for statistics controls and views.
  stats: `
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  `,
  // Download arrow into a tray for app installation controls.
  install: `
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  `,
  // Display with a play marker for the traffic-sign carousel mode.
  carousel: `
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
    <polygon points="10 7 15 10 10 13 10 7" fill="currentColor"></polygon>
  `,
  // Checked document for quiz mode.
  quiz: `
    <path d="M9 11l3 3L22 4"></path>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  `,
  // Flag for reporting a question or content issue.
  report: `
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
    <line x1="4" y1="22" x2="4" y2="15"></line>
  `,
  // Alias-shaped external-link icon for generic link contexts.
  link: `
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  `,
  // Left chevron for previous-item navigation.
  chevronLeft: `
    <polyline points="15 18 9 12 15 6"></polyline>
  `,
  // Right chevron for next-item navigation.
  chevronRight: `
    <polyline points="9 18 15 12 9 6"></polyline>
  `,
  // Upward arrow for ascending or return-to-top actions.
  arrowUp: `
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  `,
  // Right arrow for advancing to the next action or question.
  arrowRight: `
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  `,
  // Connected nodes for sharing content.
  share: `
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  `,
  // Printer for printing results.
  print: `
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  `,
  // Wireless signal marker for offline-status messaging.
  wifi: `
    <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
    <path d="M8.53 16.11a6 6 0 0 1 6.94 0"></path>
    <line x1="12" y1="20" x2="12.01" y2="20"></line>
  `,
  // Heart marker for sponsorship and project support.
  heart: `
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  `,
  // Coffee cup icon for Ko-fi support.
  coffee: `
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
    <line x1="6" y1="1" x2="6" y2="4"></line>
    <line x1="10" y1="1" x2="10" y2="4"></line>
    <line x1="14" y1="1" x2="14" y2="4"></line>
  `,
  // Credit card icon for Stripe donation links.
  creditcard: `
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
    <line x1="1" y1="10" x2="23" y2="10"></line>
  `,
  // PayPal logo for donation links.
  paypal: `
    <path fill="currentColor" stroke="none" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.972.382-1.054.9l-1.116 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.155-.044.237-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.972.382-1.054.9l-1.298 8.27h3.766c.459 0 .851-.334.923-.788l.038-.2 1.05-6.684.067-.373a.933.933 0 0 1 .922-.788h1.378c3.76 0 6.704-1.528 7.564-5.945.36-1.848.14-3.385-.889-4.39a3.784 3.784 0 0 0-.62-.476z"></path>
  `,
  // GitHub logo for developer profile and sponsor links.
  github: `
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  `,
};

/**
 * Create an SVG element for a named UI icon.
 * @param {string} name - Key of an icon in ICON_DEFS.
 * @param {Object} [options] - SVG presentation and accessibility options.
 * @param {string} [options.className] - Additional CSS class name.
 * @param {number} [options.width=16] - Rendered width in pixels.
 * @param {number} [options.height=16] - Rendered height in pixels.
 * @param {string} [options.viewBox="0 0 24 24"] - SVG viewBox value.
 * @param {string} [options.fill="none"] - SVG fill value.
 * @param {string} [options.stroke="currentColor"] - SVG stroke value.
 * @param {number} [options.strokeWidth=2.2] - SVG stroke width.
 * @param {string} [options.strokeLinecap="round"] - SVG stroke-linecap value.
 * @param {string} [options.strokeLinejoin="round"] - SVG stroke-linejoin value.
 * @param {string} [options.title] - Accessible label for the generated icon.
 * @returns {SVGElement|null} Generated SVG element, or null for an unknown icon.
 */
export function createIcon(name, options = {}) {
  const def = ICON_DEFS[name];
  if (!def) {
    return null;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const classNames = ["icon", `icon-${name}`];
  if (options.className) classNames.push(options.className);

  svg.setAttribute("class", classNames.filter(Boolean).join(" "));
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", String(options.width ?? 16));
  svg.setAttribute("height", String(options.height ?? 16));
  svg.setAttribute("viewBox", options.viewBox ?? "0 0 24 24");
  svg.setAttribute("fill", options.fill ?? "none");
  svg.setAttribute("stroke", options.stroke ?? "currentColor");
  svg.setAttribute("stroke-width", String(options.strokeWidth ?? 2.2));
  svg.setAttribute("stroke-linecap", options.strokeLinecap ?? "round");
  svg.setAttribute("stroke-linejoin", options.strokeLinejoin ?? "round");

  if (options.title) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", options.title);
  }

  svg.innerHTML = def;
  return svg;
}

/**
 * Create a named UI icon and append it to a target element.
 * @param {Element} target - Element that receives the generated icon.
 * @param {string} name - Key of an icon in ICON_DEFS.
 * @param {Object} [options] - Options forwarded to createIcon.
 * @returns {SVGElement|null} Appended SVG element, or null for an unknown icon.
 */
export function appendIcon(target, name, options = {}) {
  const icon = createIcon(name, options);
  if (!icon) return null;
  target.appendChild(icon);
  return icon;
}

/**
 * Replace a target element's contents with a named UI icon.
 * @param {Element|null} target - Element whose contents will be replaced.
 * @param {string} name - Key of an icon in ICON_DEFS.
 * @param {Object} [options] - Options forwarded to createIcon.
 * @returns {SVGElement|null} Replacement SVG element, or null if no icon is rendered.
 */
export function renderIconSlot(target, name, options = {}) {
  if (!target) return null;
  const icon = createIcon(name, {
    width: 18,
    height: 18,
    ...options,
  });
  if (!icon) return null;
  target.replaceChildren(icon);
  return icon;
}

/**
 * Render SVG icons inside [data-icon] placeholders below a root element.
 *
 * Placeholder elements may provide data-icon-width, data-icon-height,
 * data-icon-stroke-width, data-icon-fill, and data-icon-stroke attributes.
 * Existing placeholder elements remain in place so cached DOM references stay valid.
 * Their styling classes are also transferred to the generated SVG element, except
 * for `hidden`, which belongs to the placeholder's visibility state.
 * @param {Document|Element} [root=document] - Root whose descendant placeholders are hydrated.
 * @returns {void} This function updates the DOM and returns no value.
 */
export function renderDataIcons(root = document) {
  if (!root || typeof root.querySelectorAll !== "function") return;
  const nodes = root.querySelectorAll("[data-icon]");
  nodes.forEach((node) => {
    const name = node.dataset.icon;
    if (!name) return;
    const className = Array.from(node.classList)
      .filter((classToken) => classToken !== "hidden")
      .join(" ");
    const svg = createIcon(name, {
      className: className || undefined,
      width: Number(node.dataset.iconWidth || node.dataset.width || 18),
      height: Number(node.dataset.iconHeight || node.dataset.height || 18),
      strokeWidth: Number(node.dataset.iconStrokeWidth || 2.2),
      fill: node.dataset.iconFill || "none",
      stroke: node.dataset.iconStroke || "currentColor",
    });
    if (svg) node.replaceChildren(svg);
  });
}
