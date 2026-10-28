import { FETCH_HOURS, ForecastError, parseForecast } from "./forecast.js";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MAX_PLACES = 5;

/**
 * Build the Open-Meteo geocoding request for a place name or postal code.
 *
 * @param {string} query - Place name or postal code typed by the user.
 * @param {string} lang - Language for the returned names.
 * @returns {string} Request URL.
 */
export function buildSearchUrl(query, lang) {
  const params = new URLSearchParams({ name: query, count: String(MAX_PLACES), language: lang, format: "json" });
  return `${GEOCODING_URL}?${params}`;
}

/**
 * Build the Open-Meteo forecast request for one position.
 *
 * One extra hourly step is requested because each step reports the rain of the hour before it.
 *
 * @param {number} latitude - Latitude in degrees.
 * @param {number} longitude - Longitude in degrees.
 * @returns {string} Request URL.
 */
export function buildForecastUrl(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: "temperature_2m,precipitation,precipitation_probability,wind_speed_10m,wind_gusts_10m,weather_code,is_day",
    forecast_hours: String(FETCH_HOURS + 1),
    timezone: "auto",
  });
  return `${FORECAST_URL}?${params}`;
}

/**
 * Fetch a URL and parse its JSON body, mapping failures to coded errors.
 *
 * @param {string} url - Request URL.
 * @param {Function} fetchImpl - Fetch implementation.
 * @param {number} timeoutMs - Request timeout in milliseconds.
 * @returns {Promise<object>} Parsed JSON body.
 * @throws {ForecastError} With code "network" when the request fails, or "http" on an error status.
 */
async function getJson(url, fetchImpl, timeoutMs) {
  let res;
  let signal;
  try {
    signal = AbortSignal.timeout(timeoutMs);
    res = await fetchImpl(url, { signal });
  }
  catch (err) {
    throw new ForecastError("network", err && err.message);
  }
  if (!res.ok) {
    throw new ForecastError("http", `HTTP ${res.status}`);
  }
  try {
    return await res.json();
  }
  catch (err) {
    if (signal.aborted) {
      throw new ForecastError("network", err && err.message);
    }
    throw err;
  }
}

/**
 * Look up places matching a name or postal code.
 *
 * @param {string} query - Place name or postal code.
 * @param {string} lang - Language for the returned names.
 * @param {Function} [fetchImpl] - Fetch implementation, replaceable in tests.
 * @param {number} [timeoutMs=10000] - Request timeout in milliseconds.
 * @returns {Promise<Array<{id: number, name: string, admin1: string, country: string,
 *          latitude: number, longitude: number}>>} Up to five matches; empty when none.
 */
export async function searchPlaces(query, lang, fetchImpl = fetch, timeoutMs = 10000) {
  const body = await getJson(buildSearchUrl(query, lang), fetchImpl, timeoutMs);
  const results = Array.isArray(body.results) ? body.results : [];
  return results.map(({ id, name, admin1, country, latitude, longitude }) => ({ id, name, admin1, country, latitude, longitude }));
}

/**
 * Load the 24-hour forecast for a position.
 *
 * @param {number} latitude - Latitude in degrees.
 * @param {number} longitude - Longitude in degrees.
 * @param {Function} [fetchImpl] - Fetch implementation, replaceable in tests.
 * @param {number} [timeoutMs=10000] - Request timeout in milliseconds.
 * @returns {Promise<ReturnType<typeof parseForecast>>} Parsed forecast.
 */
export async function fetchForecast(latitude, longitude, fetchImpl = fetch, timeoutMs = 10000) {
  return parseForecast(await getJson(buildForecastUrl(latitude, longitude), fetchImpl, timeoutMs));
}
