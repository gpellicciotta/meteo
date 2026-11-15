// Reproducible mechanical migration from the recorded pre-migration glyphs.
import { readFileSync, writeFileSync } from "node:fs";

const originals = Object.fromEntries(Object.entries(JSON.parse(readFileSync("tests/fixtures/icon-geometry.json", "utf8")))
  .filter(([name]) => name !== "wifi"));
const shared = new Set(["close", "search", "help", "settings"]);
const local = Object.entries(originals).filter(([name]) => !shared.has(name));
writeFileSync("assets/icons.svg", `<svg xmlns="http://www.w3.org/2000/svg">\n${local.map(([name, geometry]) =>
  `  <symbol id="icon-${name}" viewBox="0 0 24 24">${geometry}  </symbol>`).join("\n")}\n</svg>\n`);
const references = Object.keys(originals).map((name) =>
  `  "${name}": "${shared.has(name) ? "vendor/design/looks/bright/icons.svg" : "assets/icons.svg"}#icon-${name}",`).join("\n");
let source = readFileSync("js/icons.js", "utf8");
source = source.replace(/^const ICON_DEFS = \{[\s\S]*?\n\};/, `const ICON_REFS = {\n${references}\n};`)
  .replaceAll("Key of an icon in ICON_DEFS", "Key of an icon in ICON_REFS")
  .replace("const def = ICON_DEFS[name];", "const ref = Object.hasOwn(ICON_REFS, name) ? ICON_REFS[name] : null;")
  .replace("if (!def)", "if (!ref)")
  .replace("svg.innerHTML = def;", 'const use = document.createElementNS("http://www.w3.org/2000/svg", "use");\n  use.setAttribute("href", ref);\n  svg.appendChild(use);');
writeFileSync("js/icons.js", source);
console.log(`Migrated ${shared.size} shared and ${local.length} app-local icons.`);
