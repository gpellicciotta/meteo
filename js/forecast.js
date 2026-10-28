export const FORECAST_HOURS = 12;

// Open-Meteo counts an hour as wet from 0.1 mm, the same threshold as its probability.
export const RAIN_THRESHOLD_MM = 0.1;

// Product display threshold for gusts, compared before rounding.
export const STRONG_GUST_THRESHOLD_KMH = 50;

// Lowest top of the bar scale, so drizzle never fills the chart like a downpour.
export const MIN_SCALE_MM = 2;

// Age at which a shown forecast is fetched again when the app becomes visible.
export const STALE_AFTER_MS = 15 * 60 * 1000;

/**
 * Error raised for forecast data and API failures, identified by a short code.
 */
export class ForecastError extends Error {
  /**
   * Create an error with a machine-readable code.
   *
   * @param {string} code - "bad_response", "http" or "network".
   * @param {string} [message] - Optional technical detail.
   */
  constructor(code, message = code) {
    super(message);
    this.name = "ForecastError";
    this.code = code;
  }
}

/**
 * Read one value of an hourly series, keeping missing values as null.
 *
 * @param {Array<number|null>|undefined} series - Hourly values.
 * @param {number} index - Step to read.
 * @returns {number|null} The value, or null when absent.
 */
function valueAt(series, index) {
  const value = Array.isArray(series) ? series[index] : null;
  return typeof value === "number" ? value : null;
}

/**
 * Map documented Open-Meteo WMO codes to a condition name and line icon.
 *
 * @param {number|null} code - Instantaneous weather code.
 * @param {number|null} isDay - 1 for daylight, 0 for night; missing values stay unknown.
 * @returns {{name: string, icon: string}|null} Condition, or null for unsupported data.
 */
export function weatherCondition(code, isDay) {
  if (code === 0 || code === 1 || code === 2) {
    if (isDay !== 0 && isDay !== 1) {
      return null;
    }
    const name = code === 2 ? "partly" : "clear";
    return { name, icon: `weather-${name}-${isDay === 1 ? "day" : "night"}` };
  }
  const groups = [
    ["cloudy", [3]], ["fog", [45, 48]],
    ["rain", [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]],
    ["snow", [71, 73, 75, 77, 85, 86]], ["thunder", [95, 96, 97, 99]],
  ];
  for (const [name, codes] of groups) {
    if (codes.includes(code)) {
      return { name, icon: `weather-${name}` };
    }
  }
  return null;
}

/**
 * Turn an Open-Meteo hourly forecast into the 12 hours shown in the chart.
 *
 * Open-Meteo reports precipitation and its probability for the hour before each time
 * step, so the response holds 13 steps: hour k runs from step k to step k + 1, taking
 * its label and temperature from step k and its rain and probability from step k + 1.
 * Wind speed is instantaneous at step k; gusts are the preceding-hour maximum at step k + 1.
 * Weather code and daylight are instantaneous at step k.
 *
 * @param {object} json - Forecast API response body.
 * @returns {{timezone: string, hours: Array<{time: string, label: string, temperature: number|null,
 *          precipitation: number|null, probability: number|null,
 *          windSpeed: number|null, windGusts: number|null,
 *          condition: {name: string, icon: string}|null}>}} Parsed forecast.
 * @throws {ForecastError} With code "bad_response" when fewer than 13 steps are present.
 */
export function parseForecast(json) {
  const hourly = json && json.hourly;
  const times = hourly && Array.isArray(hourly.time) ? hourly.time : [];
  if (times.length < FORECAST_HOURS + 1) {
    throw new ForecastError("bad_response", `Expected ${FORECAST_HOURS + 1} hourly steps, got ${times.length}`);
  }
  const hours = [];
  for (let k = 0; k < FORECAST_HOURS; k++) {
    hours.push({
      time: times[k],
      label: String(times[k]).slice(11, 16),
      temperature: valueAt(hourly.temperature_2m, k),
      precipitation: valueAt(hourly.precipitation, k + 1),
      probability: valueAt(hourly.precipitation_probability, k + 1),
      windSpeed: valueAt(hourly.wind_speed_10m, k),
      windGusts: valueAt(hourly.wind_gusts_10m, k + 1),
      condition: weatherCondition(valueAt(hourly.weather_code, k), valueAt(hourly.is_day, k)),
    });
  }
  return { timezone: json.timezone || "", hours };
}

/**
 * Summarize when rain starts and how heavy it gets.
 *
 * @param {Array<{label: string, precipitation: number|null}>} hours - Parsed forecast hours.
 * @returns {{firstRainLabel: string|null, maxPrecipitation: number}} Label of the first hour
 *          reaching the rain threshold (or null) and the highest hourly amount in mm.
 */
export function summarizeRain(hours) {
  const wet = hours.find((h) => (h.precipitation || 0) >= RAIN_THRESHOLD_MM);
  const maxPrecipitation = Math.max(0, ...hours.map((h) => h.precipitation || 0));
  return { firstRainLabel: wet ? wet.label : null, maxPrecipitation };
}

/**
 * Return independent wind and gust maxima, preserving missing data as null.
 *
 * @param {Array<{windSpeed: number|null, windGusts: number|null}>} hours - Parsed forecast hours.
 * @returns {{maxSpeed: number|null, maxGusts: number|null}} Highest values in km/h.
 */
export function summarizeWind(hours) {
  const speeds = hours.map((h) => h.windSpeed).filter((v) => v !== null);
  const gusts = hours.map((h) => h.windGusts).filter((v) => v !== null);
  return {
    maxSpeed: speeds.length ? Math.max(...speeds) : null,
    maxGusts: gusts.length ? Math.max(...gusts) : null,
  };
}

/**
 * Return the rain amount drawn as a full-height bar.
 *
 * @param {Array<{precipitation: number|null}>} hours - Parsed forecast hours.
 * @returns {number} The highest hourly amount, but at least MIN_SCALE_MM.
 */
export function barScaleMax(hours) {
  return Math.max(MIN_SCALE_MM, ...hours.map((h) => h.precipitation || 0));
}

/**
 * Tell whether a forecast fetched at a given time should be fetched again.
 *
 * @param {Date|number|null} updatedAt - Time the forecast was fetched, or null when none is shown.
 * @param {Date|number} now - Current time.
 * @returns {boolean} True once the forecast is at least STALE_AFTER_MS old.
 */
export function isStale(updatedAt, now) {
  if (updatedAt === null || updatedAt === undefined) {
    return false;
  }
  return now - updatedAt >= STALE_AFTER_MS;
}

/**
 * Build a readable place name from a geocoding result.
 *
 * @param {{name?: string, admin1?: string, country?: string}} place - Geocoding match.
 * @returns {string} Name, region and country joined by commas, without empty or repeated parts.
 */
export function formatPlace(place) {
  const parts = [];
  for (const part of [place.name, place.admin1, place.country]) {
    if (part && !parts.includes(part)) {
      parts.push(part);
    }
  }
  return parts.join(", ");
}
