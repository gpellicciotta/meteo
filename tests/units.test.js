import { describe, expect, it } from "vitest";
import { METRIC_UNITS, activeUnits, convertValue, storedUnits, unitDigits, unitsForCountry } from "../js/units.js";

const IMPERIAL = { temperature: "f", precipitation: "in", wind: "mph" };

describe("unitsForCountry", () => {
  it.each(["US", "us", "PR"])("gives Fahrenheit, inches and mph for %s", (code) => {
    expect(unitsForCountry(code)).toEqual(IMPERIAL);
  });

  it("gives mph wind with Celsius and millimeters for Great Britain", () => {
    expect(unitsForCountry("GB")).toEqual({ temperature: "c", precipitation: "mm", wind: "mph" });
  });

  it("gives the metric units for other countries", () => {
    expect(unitsForCountry("BE")).toEqual(METRIC_UNITS);
  });

  it.each([[""], [null], [undefined]])("gives null without a country code (%j)", (code) => {
    expect(unitsForCountry(code)).toBeNull();
  });
});

describe("storedUnits", () => {
  it("passes stored units with valid options for every kind", () => {
    expect(storedUnits({ units: IMPERIAL })).toEqual(IMPERIAL);
    expect(storedUnits({ units: { temperature: "c", precipitation: "mm", wind: "ms" } }))
      .toEqual({ temperature: "c", precipitation: "mm", wind: "ms" });
  });

  it.each([[{}], [null], [{ units: "metric" }], [{ units: { temperature: "f", precipitation: "in" } }],
    [{ units: { temperature: "k", precipitation: "mm", wind: "kmh" } }]])("gives null for %j", (prefs) => {
    expect(storedUnits(prefs)).toBeNull();
  });
});

describe("activeUnits", () => {
  it("defaults to Celsius, millimeters and km/h", () => {
    expect(activeUnits({})).toEqual({ temperature: "c", precipitation: "mm", wind: "kmh" });
    expect(activeUnits({ units: IMPERIAL })).toEqual(IMPERIAL);
  });
});

describe("convertValue", () => {
  it("converts metric values to the chosen unit", () => {
    expect(convertValue("temperature", 10, "f")).toBe(50);
    expect(convertValue("temperature", -40, "f")).toBe(-40);
    expect(convertValue("temperature", 10, "c")).toBe(10);
    expect(convertValue("precipitation", 25.4, "in")).toBeCloseTo(1, 10);
    expect(convertValue("wind", 100, "mph")).toBeCloseTo(62.14, 2);
    expect(convertValue("wind", 36, "ms")).toBeCloseTo(10, 10);
  });

  it("keeps missing values", () => {
    expect(convertValue("wind", null, "mph")).toBeNull();
  });
});

describe("unitDigits", () => {
  it.each([["c", 0], ["f", 0], ["kmh", 0], ["mph", 0], ["ms", 0], ["mm", 1], ["in", 2]])("gives %s %i digits", (unit, digits) => {
    expect(unitDigits(unit)).toBe(digits);
  });
});
