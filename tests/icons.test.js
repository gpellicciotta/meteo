// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createIcon } from "../js/icons.js";
import originals from "./fixtures/icon-geometry.json";

it.each(Object.keys(originals).filter((name) => name !== "wifi"))("resolves %s to unchanged external geometry", (name) => {
  const svg = createIcon(name);
  const use = svg.querySelector("use");
  expect(use).not.toBeNull();
  expect(svg.querySelector("path, circle, line, rect, polyline")).toBeNull();
  const [file, id] = use.getAttribute("href").split("#");
  const doc = new DOMParser().parseFromString(readFileSync(file, "utf8"), "image/svg+xml");
  const symbol = doc.getElementById(id);
  expect(symbol).not.toBeNull();
  const normalize = (markup) => markup.replace(/\s+/g, " ").trim();
  expect(normalize(symbol.innerHTML)).toBe(normalize(originals[name]));
  expect(symbol.getAttribute("viewBox")).toBe("0 0 24 24");
  expect(svg.getAttribute("stroke-width")).toBe("2.2");
  expect(svg.getAttribute("stroke")).toBe("currentColor");
});

it("preserves options and rejects unknown names", () => {
  const svg = createIcon("search", { width: 28, height: 32, strokeWidth: 3, title: "Find" });
  expect(svg.getAttribute("width")).toBe("28");
  expect(svg.getAttribute("height")).toBe("32");
  expect(svg.getAttribute("stroke-width")).toBe("3");
  expect(svg.getAttribute("aria-label")).toBe("Find");
  expect(createIcon("unknown")).toBeNull();
  expect(createIcon("toString")).toBeNull();
});

it("precaches both sprite files", () => {
  const worker = readFileSync("sw.js", "utf8");
  expect(worker).toContain('"assets/icons.svg"');
  expect(worker).toContain('"vendor/design/looks/bright/icons.svg"');
});

it("removes the wifi icon replaced by the shared offline banner", () => {
  expect(createIcon("wifi")).toBeNull();
  expect(readFileSync("assets/icons.svg", "utf8")).not.toContain('id="icon-wifi"');
});
