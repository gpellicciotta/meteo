export const FORECAST_HOURS = 12;

// Hours fetched, so a saved forecast still covers the next hours later in the day.
export const FETCH_HOURS = 24;

// Fewest upcoming hours for which a saved forecast is still shown.
export const MIN_SAVED_HOURS = 6;

const CONDITION_NAMES = ["clear", "partly", "cloudy", "fog", "rain", "snow", "thunder"];

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
 * Turn an Open-Meteo hourly forecast into forecast hours, one fewer than the time steps.
 *
 * Open-Meteo reports precipitation and its probability for the hour before each time
 * step, so the response holds one extra step: hour k runs from step k to step k + 1, taking
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
  for (let k = 0; k < times.length - 1; k++) {
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
 * Return the current hour in a timezone, formatted like the start of an Open-Meteo time step.
 *
 * @param {string} timezone - IANA timezone of the forecast.
 * @param {Date|number} now - Current time.
 * @returns {string|null} Date and hour such as "2026-10-28T10", or null without a valid timezone.
 */
function currentHourKey(timezone, now) {
  if (!timezone) {
    return null;
  }
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    }).formatToParts(now);
  }
  catch {
    return null;
  }
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}`;
}

/**
 * Tell whether a forecast time step falls in the current hour of the forecast timezone.
 *
 * @param {string} time - Local time step such as "2026-10-28T10:00", as Open-Meteo returns it.
 * @param {string} timezone - IANA timezone of the forecast.
 * @param {Date|number} now - Current time.
 * @returns {boolean} True when the step's date and hour match now in that timezone; false without a valid timezone.
 */
export function isCurrentHour(time, timezone, now) {
  const key = currentHourKey(timezone, now);
  return key !== null && String(time).slice(0, 13) === key;
}

/**
 * Return the forecast hours to show: up to 12 from the current hour on.
 *
 * Hours that already passed are dropped, so an older forecast never shows the past.
 *
 * @param {{timezone: string, hours: Array<{time: string}>}} forecast - Parsed forecast.
 * @param {Date|number} now - Current time.
 * @returns {Array<object>} Visible hours; fewer than 12 when the data runs out, and the first 12
 *          when the timezone is unusable.
 */
export function visibleHours(forecast, now) {
  const key = currentHourKey(forecast.timezone, now);
  const upcoming = key === null ? forecast.hours : forecast.hours.filter((h) => String(h.time).slice(0, 13) >= key);
  return upcoming.slice(0, FORECAST_HOURS);
}

/**
 * Decide whether the search row is open after a view event.
 *
 * Without a forecast the row is always open, so a place can be searched.
 *
 * @param {boolean} open - Whether the row is open now.
 * @param {"chosen"|"toggled"|"rendered"} event - A forecast shown for a newly chosen place,
 *        the footer button, or any other render such as a refresh or language switch.
 * @param {boolean} forecastShown - Whether a forecast is shown after the event.
 * @returns {boolean} Whether the row is open afterwards.
 */
export function searchRowOpen(open, event, forecastShown) {
  if (!forecastShown) {
    return true;
  }
  if (event === "chosen") {
    return false;
  }
  return event === "toggled" ? !open : open;
}

/**
 * Return the key matching a saved forecast to its place.
 *
 * @param {{kind: string, id?: number, latitude: number, longitude: number}} place - Shown place.
 * @returns {string} The place id, or the coordinates rounded to two decimals for the current location.
 */
export function placeKey(place) {
  if (place.kind === "place" && place.id) {
    return String(place.id);
  }
  return `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
}

/**
 * Tell whether a value restored from storage has the shape of a parsed forecast hour.
 *
 * @param {*} hour - Stored value.
 * @returns {boolean} True for an hour that renderForecast can show.
 */
function isForecastHour(hour) {
  if (!hour || typeof hour !== "object" || typeof hour.label !== "string"
    || typeof hour.time !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(hour.time)) {
    return false;
  }
  const numeric = ["temperature", "precipitation", "probability", "windSpeed", "windGusts"];
  if (!numeric.every((key) => hour[key] === null || Number.isFinite(hour[key]))) {
    return false;
  }
  const { condition } = hour;
  return condition === null || Boolean(condition && CONDITION_NAMES.includes(condition.name)
    && new RegExp(`^weather-${condition.name}(-day|-night)?$`).test(condition.icon));
}

/**
 * Restore the last saved forecast when it belongs to the given place and is well formed.
 *
 * @param {*} saved - Stored `{placeKey, fetchedAt, forecast}` value, as read from storage.
 * @param {string} key - Place key of the place to show, from placeKey().
 * @returns {{forecast: ReturnType<typeof parseForecast>, fetchedAt: Date}|null} The forecast and
 *          its fetch time, or null for another place or malformed data.
 */
export function restoreForecast(saved, key) {
  if (!saved || typeof saved !== "object" || saved.placeKey !== key || typeof saved.fetchedAt !== "string") {
    return null;
  }
  const fetchedAt = new Date(saved.fetchedAt);
  const { forecast } = saved;
  if (Number.isNaN(fetchedAt.getTime()) || !forecast || typeof forecast !== "object" || typeof forecast.timezone !== "string"
    || !Array.isArray(forecast.hours) || forecast.hours.length === 0 || !forecast.hours.every(isForecastHour)) {
    return null;
  }
  return { forecast, fetchedAt };
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
