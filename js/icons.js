const ICON_REFS = {
  "weather-clear-day": "assets/icons.svg#icon-weather-clear-day",
  "weather-clear-night": "assets/icons.svg#icon-weather-clear-night",
  "weather-partly-day": "assets/icons.svg#icon-weather-partly-day",
  "weather-partly-night": "assets/icons.svg#icon-weather-partly-night",
  "weather-cloudy": "assets/icons.svg#icon-weather-cloudy",
  "weather-fog": "assets/icons.svg#icon-weather-fog",
  "weather-rain": "assets/icons.svg#icon-weather-rain",
  "weather-snow": "assets/icons.svg#icon-weather-snow",
  "weather-thunder": "assets/icons.svg#icon-weather-thunder",
  "wind-arrow": "assets/icons.svg#icon-wind-arrow",
  "close": "vendor/design/looks/bright/icons.svg#icon-close",
  "locate": "assets/icons.svg#icon-locate",
  "search": "vendor/design/looks/bright/icons.svg#icon-search",
  "externalLink": "assets/icons.svg#icon-externalLink",
  "help": "vendor/design/looks/bright/icons.svg#icon-help",
  "settings": "vendor/design/looks/bright/icons.svg#icon-settings",
  "install": "assets/icons.svg#icon-install",
  "coffee": "assets/icons.svg#icon-coffee",
  "creditcard": "assets/icons.svg#icon-creditcard",
  "paypal": "assets/icons.svg#icon-paypal",
  "github": "assets/icons.svg#icon-github",
};

/**
 * Create an SVG element for a named UI icon.
 * @param {string} name - Key of an icon in ICON_REFS.
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
  const ref = Object.hasOwn(ICON_REFS, name) ? ICON_REFS[name] : null;
  if (!ref) {
    return null;
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  // Not the vendored "icon" class: its CSS size and stroke would override the attributes below.
  const classNames = ["app-icon", `icon-${name}`];
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

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", ref);
  svg.appendChild(use);
  return svg;
}

/**
 * Create a named UI icon and append it to a target element.
 * @param {Element} target - Element that receives the generated icon.
 * @param {string} name - Key of an icon in ICON_REFS.
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
 * @param {string} name - Key of an icon in ICON_REFS.
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
