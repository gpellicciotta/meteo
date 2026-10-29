import { parseForecast } from "./forecast.js";

// A fixed Open-Meteo style response from 10:00, chosen so every part of the forecast card shows.
const SAMPLE_RESPONSE = {
  timezone: "Europe/Brussels",
  hourly: {
    time: Array.from({ length: 13 }, (_, i) => `2026-10-28T${String(10 + i).padStart(2, "0")}:00`),
    temperature_2m: [9.2, 10.1, 11.4, 12.2, 12.6, 12.1, 11.3, 10.8, 10.2, 9.6, 9.1, 8.7, 8.4],
    precipitation: [0, 0, 0, 0.05, 0.4, 1.2, 2.6, 0.8, 0.2, 0, 0, 0, 0],
    precipitation_probability: [5, 5, 10, 25, 60, 80, 90, 75, 45, 20, 10, 5, 5],
    wind_speed_10m: [15, 17, 21, 26, 31, 35, 33, 28, 24, 20, 17, 15, 14],
    wind_gusts_10m: [25, 28, 33, 41, 50, 58, 62, 55, 44, 36, 30, 27, 25],
    wind_direction_10m: [180, 190, 200, 210, 220, 230, 240, 250, 255, 260, 265, 270, 270],
    weather_code: [2, 3, 3, 61, 61, 63, 61, 3, 2, 0, 0, 0, 1],
    is_day: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
  },
};

/**
 * Return the sample forecast hours shown in the About guide.
 *
 * @returns {ReturnType<typeof parseForecast>["hours"]} Twelve hours from 10:00, with rain, gusts
 *          and wind veering from south to west, and day and night conditions.
 */
export function guideHours() {
  return parseForecast(SAMPLE_RESPONSE).hours;
}
