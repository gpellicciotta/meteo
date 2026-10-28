import { ForecastError } from "./forecast.js";

const GEOLOCATION_ERROR_CODES = { 1: "geo_denied", 2: "geo_unavailable", 3: "geo_timeout" };

/**
 * Ask the browser for the device position.
 *
 * @param {Geolocation} [geolocation] - Geolocation API, replaceable in tests.
 * @returns {Promise<{latitude: number, longitude: number}>} Position in degrees.
 * @throws {ForecastError} With code "geo_unsupported", "geo_denied", "geo_unavailable" or "geo_timeout".
 */
export function getCurrentCoordinates(geolocation = typeof navigator !== "undefined" ? navigator.geolocation : undefined) {
  return new Promise((resolve, reject) => {
    if (!geolocation) {
      reject(new ForecastError("geo_unsupported"));
      return;
    }
    geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new ForecastError(GEOLOCATION_ERROR_CODES[err.code] || "geo_unavailable", err.message)),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
