// Options per kind of value; the first option is the metric unit the app fetches and stores.
export const UNIT_OPTIONS = {
  temperature: ["c", "f"],
  precipitation: ["mm", "in"],
  wind: ["kmh", "mph", "ms"],
};

export const METRIC_UNITS = { temperature: "c", precipitation: "mm", wind: "kmh" };

const IMPERIAL_UNITS = { temperature: "f", precipitation: "in", wind: "mph" };

// The United States and its inhabited territories forecast in Fahrenheit, inches and mph.
const IMPERIAL_COUNTRIES = ["US", "PR", "GU", "VI", "AS", "MP", "UM"];

// UK forecasts give temperature and rain in metric units, but wind in mph.
const MPH_WIND_COUNTRIES = ["GB"];

const DIGITS = { c: 0, f: 0, mm: 1, in: 2, kmh: 0, mph: 0, ms: 0 };

const KMH_PER_MPH = 1.609344;
const KMH_PER_MS = 3.6;
const MM_PER_INCH = 25.4;

/**
 * Return the stored units when every kind holds a known option.
 *
 * @param {*} prefs - Stored preferences object, as read from storage.
 * @returns {{temperature: string, precipitation: string, wind: string}|null} Stored units, or null
 *          when they were never set or are malformed.
 */
export function storedUnits(prefs) {
  const units = prefs && typeof prefs === "object" ? prefs.units : null;
  if (!units || typeof units !== "object") {
    return null;
  }
  const valid = Object.entries(UNIT_OPTIONS).every(([kind, options]) => options.includes(units[kind]));
  return valid ? { temperature: units.temperature, precipitation: units.precipitation, wind: units.wind } : null;
}

/**
 * Return the units to show: the stored ones, or the metric units.
 *
 * @param {*} prefs - Stored preferences object, as read from storage.
 * @returns {{temperature: string, precipitation: string, wind: string}} Units.
 */
export function activeUnits(prefs) {
  return storedUnits(prefs) || { ...METRIC_UNITS };
}

/**
 * Return the usual forecast units of a country.
 *
 * @param {string|null|undefined} countryCode - ISO 3166-1 alpha-2 code, in any case.
 * @returns {{temperature: string, precipitation: string, wind: string}|null} Units, or null without a code.
 */
export function unitsForCountry(countryCode) {
  const code = typeof countryCode === "string" ? countryCode.trim().toUpperCase() : "";
  if (!code) {
    return null;
  }
  if (IMPERIAL_COUNTRIES.includes(code)) {
    return { ...IMPERIAL_UNITS };
  }
  return { ...METRIC_UNITS, wind: MPH_WIND_COUNTRIES.includes(code) ? "mph" : METRIC_UNITS.wind };
}

/**
 * Convert a metric forecast value to a unit.
 *
 * @param {"temperature"|"precipitation"|"wind"} kind - Kind of value: °C, mm or km/h.
 * @param {number|null} value - Metric value, or null when missing.
 * @param {string} unit - Target unit option of that kind.
 * @returns {number|null} Converted value, or null when missing.
 */
export function convertValue(kind, value, unit) {
  if (value === null || value === undefined) {
    return null;
  }
  if (kind === "temperature" && unit === "f") {
    return value * 9 / 5 + 32;
  }
  if (kind === "precipitation" && unit === "in") {
    return value / MM_PER_INCH;
  }
  if (kind === "wind" && unit === "mph") {
    return value / KMH_PER_MPH;
  }
  if (kind === "wind" && unit === "ms") {
    return value / KMH_PER_MS;
  }
  return value;
}

/**
 * Return the fraction digits shown for a unit.
 *
 * @param {string} unit - Unit option.
 * @returns {number} Fraction digits.
 */
export function unitDigits(unit) {
  return DIGITS[unit] ?? 0;
}
