import { describe, expect, it } from "vitest";
import { barScaleMax, formatPlace, parseForecast, summarizeRain } from "../js/forecast.js";
import { buildForecastUrl, buildSearchUrl, fetchForecast, searchPlaces } from "../js/weather-api.js";
import { getCurrentCoordinates } from "../js/geolocation.js";

/**
 * Build an Open-Meteo style hourly forecast response.
 *
 * @param {number[]} rain - Precipitation per hourly step.
 * @param {object} [overrides] - Extra hourly arrays to replace.
 * @returns {object} Response body as returned by the forecast API.
 */
function forecastResponse(rain, overrides = {}) {
  const time = rain.map((_, i) => `2026-10-28T${String(10 + i).padStart(2, "0")}:00`);
  return {
    timezone: "Europe/Brussels",
    hourly: {
      time,
      temperature_2m: rain.map((_, i) => 10 + i),
      precipitation: rain,
      precipitation_probability: rain.map((_, i) => i * 5),
      ...overrides,
    },
  };
}

/**
 * Build a fake fetch that answers with a fixed status and body, recording the URL.
 *
 * @param {number} status - HTTP status to answer with.
 * @param {object} body - JSON body to answer with.
 * @returns {Function & {calls: string[]}} Fake fetch implementation.
 */
function fakeFetch(status, body) {
  const fn = async (url) => {
    fn.calls.push(url);
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  };
  fn.calls = [];
  return fn;
}

const RAIN = [9, 0, 0, 0.05, 0.4, 1.2, 0.3, 0, 0, 0, 0, 0, 0];

describe("parseForecast", () => {
  it("turns 13 hourly steps into 12 hours with the rain of the following hour", () => {
    const forecast = parseForecast(forecastResponse(RAIN));
    expect(forecast.timezone).toBe("Europe/Brussels");
    expect(forecast.hours).toHaveLength(12);
    expect(forecast.hours[0]).toEqual({ time: "2026-10-28T10:00", label: "10:00", temperature: 10, precipitation: 0, probability: 5 });
    expect(forecast.hours[4]).toMatchObject({ label: "14:00", temperature: 14, precipitation: 1.2, probability: 25 });
    expect(forecast.hours[11]).toMatchObject({ label: "21:00", precipitation: 0, probability: 60 });
  });

  it("rejects a response with fewer than 13 hourly steps", () => {
    expect(() => parseForecast(forecastResponse(RAIN.slice(0, 12)))).toThrow(expect.objectContaining({ code: "bad_response" }));
    expect(() => parseForecast({})).toThrow(expect.objectContaining({ code: "bad_response" }));
  });

  it("keeps missing values as null", () => {
    const forecast = parseForecast(forecastResponse(RAIN, { precipitation_probability: RAIN.map(() => null) }));
    expect(forecast.hours[0].probability).toBeNull();
  });
});

describe("summarizeRain", () => {
  it("reports the first hour reaching 0.1 mm and the highest hourly amount", () => {
    const { hours } = parseForecast(forecastResponse(RAIN));
    expect(summarizeRain(hours)).toEqual({ firstRainLabel: "13:00", maxPrecipitation: 1.2 });
  });

  it("reports no rain when every hour stays below 0.1 mm", () => {
    const { hours } = parseForecast(forecastResponse(RAIN.map(() => 0.05)));
    expect(summarizeRain(hours)).toEqual({ firstRainLabel: null, maxPrecipitation: 0.05 });
  });
});

describe("barScaleMax", () => {
  it("uses 2 mm for light rain and the highest amount for heavy rain", () => {
    expect(barScaleMax(parseForecast(forecastResponse(RAIN)).hours)).toBe(2);
    expect(barScaleMax(parseForecast(forecastResponse(RAIN.map((v) => v * 5))).hours)).toBe(6);
  });
});

describe("formatPlace", () => {
  it("joins name, region and country without missing or duplicate parts", () => {
    expect(formatPlace({ name: "Gent", admin1: "Flanders", country: "Belgium" })).toBe("Gent, Flanders, Belgium");
    expect(formatPlace({ name: "Brussels", admin1: "Brussels", country: "Belgium" })).toBe("Brussels, Belgium");
    expect(formatPlace({ name: "Monaco", country: "Monaco" })).toBe("Monaco");
  });
});

describe("weather API client", () => {
  it("builds the documented geocoding and forecast URLs", () => {
    expect(buildSearchUrl("Sint-Niklaas & co", "nl")).toBe(
      "https://geocoding-api.open-meteo.com/v1/search?name=Sint-Niklaas+%26+co&count=5&language=nl&format=json",
    );
    expect(buildForecastUrl(50.85, 4.35)).toBe(
      "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35"
      + "&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probability&forecast_hours=13&timezone=auto",
    );
  });

  it("returns geocoding matches and an empty list when nothing matches", async () => {
    const place = { id: 1, name: "Gent", admin1: "Flanders", country: "Belgium", latitude: 51.05, longitude: 3.72, extra: 1 };
    const fetchMatch = fakeFetch(200, { results: [place] });
    expect(await searchPlaces("Gent", "en", fetchMatch)).toEqual([
      { id: 1, name: "Gent", admin1: "Flanders", country: "Belgium", latitude: 51.05, longitude: 3.72 },
    ]);
    expect(fetchMatch.calls[0]).toContain("name=Gent");
    expect(await searchPlaces("Xyzzy", "en", fakeFetch(200, { generationtime_ms: 1 }))).toEqual([]);
  });

  it("parses a forecast response", async () => {
    const forecast = await fetchForecast(50.85, 4.35, fakeFetch(200, forecastResponse(RAIN)));
    expect(forecast.hours).toHaveLength(12);
  });

  it("maps HTTP and network failures to error codes", async () => {
    await expect(fetchForecast(0, 0, fakeFetch(500, {}))).rejects.toMatchObject({ code: "http" });
    await expect(searchPlaces("Gent", "en", fakeFetch(429, {}))).rejects.toMatchObject({ code: "http" });
    const offline = async () => {
      throw new TypeError("Failed to fetch");
    };
    await expect(fetchForecast(0, 0, offline)).rejects.toMatchObject({ code: "network" });
  });
});

describe("getCurrentCoordinates", () => {
  it("resolves the device position", async () => {
    const geo = { getCurrentPosition: (ok) => ok({ coords: { latitude: 50.85, longitude: 4.35 } }) };
    expect(await getCurrentCoordinates(geo)).toEqual({ latitude: 50.85, longitude: 4.35 });
  });

  it("maps refusals and missing support to error codes", async () => {
    const denied = { getCurrentPosition: (_ok, fail) => fail({ code: 1, message: "denied" }) };
    await expect(getCurrentCoordinates(denied)).rejects.toMatchObject({ code: "geo_denied" });
    const timeout = { getCurrentPosition: (_ok, fail) => fail({ code: 3, message: "timeout" }) };
    await expect(getCurrentCoordinates(timeout)).rejects.toMatchObject({ code: "geo_timeout" });
    await expect(getCurrentCoordinates(null)).rejects.toMatchObject({ code: "geo_unsupported" });
  });
});
