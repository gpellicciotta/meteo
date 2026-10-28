import { ForecastError } from "./forecast.js";

const GEOLOCATION_ERROR_CODES = { 1: "geo_denied", 2: "geo_unavailable", 3: "geo_timeout" };

// The browser's own timeout only starts once permission is granted, so an ignored
// permission prompt would otherwise leave the request pending forever.
const OVERALL_TIMEOUT_MS = 30000;

/**
 * Ask the browser for the device position.
 *
 * @param {Geolocation} [geolocation] - Geolocation API, replaceable in tests.
 * @param {number} [timeoutMs] - Overall time limit, including an unanswered permission prompt.
 * @returns {Promise<{latitude: number, longitude: number}>} Position in degrees.
 * @throws {ForecastError} With code "geo_unsupported", "geo_denied", "geo_unavailable" or "geo_timeout".
 */
export function getCurrentCoordinates(
  geolocation = typeof navigator !== "undefined" ? navigator.geolocation : undefined,
  timeoutMs = OVERALL_TIMEOUT_MS,
) {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(new ForecastError("geo_unsupported"));
      return;
    }
    const timer = setTimeout(() => reject(new ForecastError("geo_timeout")), timeoutMs);
    geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      },
      (err) => {
        clearTimeout(timer);
        reject(new ForecastError(GEOLOCATION_ERROR_CODES[err.code] || "geo_unavailable", err.message));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
