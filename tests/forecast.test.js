import { describe, expect, it, vi } from "vitest";
import { STALE_AFTER_MS, barScaleMax, formatPlace, isCurrentHour, isStale, parseForecast, summarizeRain, summarizeWind, weatherCondition } from "../js/forecast.js";
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
    expect(forecast.hours[0]).toEqual({ time: "2026-10-28T10:00", label: "10:00", temperature: 10, precipitation: 0, probability: 5, windSpeed: null, windGusts: null, condition: null });
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

  it("aligns instantaneous speed and preceding-hour gusts across the entire window", () => {
    const { hours } = parseForecast(forecastResponse(RAIN, {
      wind_speed_10m: [40, ...Array(11).fill(20), 99],
      wind_gusts_10m: [99, ...Array(11).fill(35), 70],
    }));
    expect(hours[0]).toMatchObject({ windSpeed: 40, windGusts: 35 });
    expect(hours[11]).toMatchObject({ windSpeed: 20, windGusts: 70 });
    expect(summarizeWind(hours)).toEqual({ maxSpeed: 40, maxGusts: 70 });
  });

  it("keeps absent arrays, missing entries, and explicit null wind values as null", () => {
    const { hours } = parseForecast(forecastResponse(RAIN, {
      wind_speed_10m: [null, 0], wind_gusts_10m: [90, null, 0],
    }));
    expect(hours[0]).toMatchObject({ windSpeed: null, windGusts: null });
    expect(hours[1]).toMatchObject({ windSpeed: 0, windGusts: 0 });
    expect(hours[2]).toMatchObject({ windSpeed: null, windGusts: null });
    expect(parseForecast(forecastResponse(RAIN)).hours.every((h) => h.windSpeed === null && h.windGusts === null)).toBe(true);
  });
});

describe("weatherCondition", () => {
  it("maps every documented WMO code to its condition and icon", () => {
    const groups = [
      ["cloudy", [3]], ["fog", [45, 48]],
      ["rain", [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]],
      ["snow", [71, 73, 75, 77, 85, 86]], ["thunder", [95, 96, 97, 99]],
    ];
    for (const [name, codes] of groups) {
      for (const code of codes) {
        for (const isDay of [0, 1, null]) {
          expect(weatherCondition(code, isDay)).toEqual({ name, icon: `weather-${name}` });
        }
      }
    }
    for (const code of [0, 1, 2]) {
      const name = code === 2 ? "partly" : "clear";
      expect(weatherCondition(code, 1)).toEqual({ name, icon: `weather-${name}-day` });
      expect(weatherCondition(code, 0)).toEqual({ name, icon: `weather-${name}-night` });
      for (const missing of [null, undefined, 2, "0"]) {
        expect(weatherCondition(code, missing)).toBeNull();
      }
    }
  });

  it("omits unknown, missing, and nonnumeric codes", () => {
    for (const code of [null, undefined, -1, 4, 52, 60, 72, 98, 100, "61", NaN, 61.5]) {
      expect(weatherCondition(code, 1)).toBeNull();
    }
  });

  it("uses instantaneous weather and daylight at step k, including the final displayed hour", () => {
    const { hours } = parseForecast(forecastResponse(RAIN, {
      weather_code: [0, 61, ...Array(9).fill(null), 2, 95],
      is_day: [0, 1, ...Array(9).fill(1), 0, 1],
    }));
    expect(hours[0].condition).toEqual({ name: "clear", icon: "weather-clear-night" });
    expect(hours[1].condition).toEqual({ name: "rain", icon: "weather-rain" });
    expect(hours[2].condition).toBeNull();
    expect(hours[11].condition).toEqual({ name: "partly", icon: "weather-partly-night" });
    expect(parseForecast(forecastResponse(RAIN)).hours.every((h) => h.condition === null)).toBe(true);
  });
});

describe("summarizeWind", () => {
  it("finds independent maxima without rounding or replacing missing data with zero", () => {
    expect(summarizeWind([
      { windSpeed: 20.4, windGusts: null },
      { windSpeed: null, windGusts: 70.6 },
      { windSpeed: 10, windGusts: 35 },
    ])).toEqual({ maxSpeed: 20.4, maxGusts: 70.6 });
    expect(summarizeWind([{ windSpeed: 0, windGusts: 0 }])).toEqual({ maxSpeed: 0, maxGusts: 0 });
  });

  it("returns null for each missing series independently", () => {
    expect(summarizeWind([])).toEqual({ maxSpeed: null, maxGusts: null });
    expect(summarizeWind([{ windSpeed: null, windGusts: null }])).toEqual({ maxSpeed: null, maxGusts: null });
    expect(summarizeWind([{ windSpeed: null, windGusts: 70 }])).toEqual({ maxSpeed: null, maxGusts: 70 });
    expect(summarizeWind([{ windSpeed: 20, windGusts: null }])).toEqual({ maxSpeed: 20, maxGusts: null });
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

describe("isStale", () => {
  const updatedAt = new Date("2026-10-28T10:00:00Z");

  it("turns stale after exactly 15 minutes", () => {
    expect(STALE_AFTER_MS).toBe(15 * 60 * 1000);
    expect(isStale(updatedAt, updatedAt.getTime() + (14 * 60 + 59) * 1000)).toBe(false);
    expect(isStale(updatedAt, updatedAt.getTime() + 15 * 60 * 1000)).toBe(true);
  });

  it("is never stale without a forecast", () => {
    expect(isStale(null, Date.now())).toBe(false);
  });
});

describe("isCurrentHour", () => {
  it("is true for the hour containing now in the forecast timezone", () => {
    // Brussels is at UTC+1 after the switch to winter time on 2026-10-25.
    expect(isCurrentHour("2026-10-28T10:00", "Europe/Brussels", new Date("2026-10-28T09:00:00Z"))).toBe(true);
    expect(isCurrentHour("2026-10-28T10:00", "Europe/Brussels", new Date("2026-10-28T09:59:59Z"))).toBe(true);
    expect(isCurrentHour("2026-10-29T00:00", "Europe/Brussels", new Date("2026-10-28T23:15:00Z"))).toBe(true);
  });

  it("is false one hour later or earlier", () => {
    expect(isCurrentHour("2026-10-28T10:00", "Europe/Brussels", new Date("2026-10-28T10:00:00Z"))).toBe(false);
    expect(isCurrentHour("2026-10-28T10:00", "Europe/Brussels", new Date("2026-10-28T08:59:59Z"))).toBe(false);
    expect(isCurrentHour("2026-10-28T10:00", "Europe/Brussels", new Date("2026-10-29T09:30:00Z"))).toBe(false);
  });

  it("uses the forecast timezone rather than the device timezone", () => {
    const now = new Date("2026-10-28T09:30:00Z");
    expect(isCurrentHour("2026-10-28T05:00", "America/New_York", now)).toBe(true);
    expect(isCurrentHour("2026-10-28T18:00", "Asia/Tokyo", now)).toBe(true);
    expect(isCurrentHour("2026-10-28T10:00", "Asia/Tokyo", now)).toBe(false);
  });

  it("is false without a usable timezone", () => {
    const now = new Date("2026-10-28T09:30:00Z");
    expect(isCurrentHour("2026-10-28T10:00", "", now)).toBe(false);
    expect(isCurrentHour("2026-10-28T10:00", "Not/AZone", now)).toBe(false);
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
  it.each([
    ["searchPlaces", (fetchImpl, timeoutMs) => searchPlaces("Gent", "en", fetchImpl, timeoutMs)],
    ["fetchForecast", (fetchImpl, timeoutMs) => fetchForecast(0, 0, fetchImpl, timeoutMs)],
  ])("aborts stalled %s requests with the network error", async (_name, request) => {
    let signal;
    const stalled = (_url, options) => {
      signal = options?.signal;
      return new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(signal.reason), { once: true });
      });
    };
    const result = request(stalled, 20);
    expect(signal).toBeInstanceOf(AbortSignal);
    await expect(result).rejects.toMatchObject({ code: "network" });
    expect(signal.aborted).toBe(true);
    expect(signal.reason.name).toBe("TimeoutError");
  });

  it("defaults both request timeouts to 10 seconds", async () => {
    const timeout = vi.spyOn(AbortSignal, "timeout");
    try {
      await searchPlaces("Gent", "en", fakeFetch(200, {}));
      await fetchForecast(0, 0, fakeFetch(200, forecastResponse(RAIN)));
      expect(timeout.mock.calls).toEqual([[10000], [10000]]);
    }
    finally {
      timeout.mockRestore();
    }
  });

  it.each([
    ["searchPlaces", (fetchImpl) => searchPlaces("Gent", "en", fetchImpl, 20)],
    ["fetchForecast", (fetchImpl) => fetchForecast(0, 0, fetchImpl, 20)],
  ])("maps %s body timeouts to the network error", async (_name, request) => {
    const stalledBody = async (_url, { signal }) => ({
      ok: true,
      status: 200,
      json: () => new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
      }),
    });
    await expect(request(stalledBody)).rejects.toMatchObject({ name: "ForecastError", code: "network" });
  });

  it("preserves unrelated JSON parsing errors", async () => {
    const invalidJson = new SyntaxError("Invalid JSON");
    const malformed = async () => ({ ok: true, json: async () => { throw invalidJson; } });
    await expect(searchPlaces("Gent", "en", malformed)).rejects.toBe(invalidJson);
    await expect(fetchForecast(0, 0, malformed)).rejects.toBe(invalidJson);
  });

  it("builds the documented geocoding and forecast URLs", () => {
    expect(buildSearchUrl("Sint-Niklaas & co", "nl")).toBe(
      "https://geocoding-api.open-meteo.com/v1/search?name=Sint-Niklaas+%26+co&count=5&language=nl&format=json",
    );
    expect(buildForecastUrl(50.85, 4.35)).toBe(
      "https://api.open-meteo.com/v1/forecast?latitude=50.85&longitude=4.35"
      + "&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probability%2Cwind_speed_10m%2Cwind_gusts_10m%2Cweather_code%2Cis_day&forecast_hours=13&timezone=auto",
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

  it("gives up when the permission prompt is never answered", async () => {
    const silent = { getCurrentPosition: () => {} };
    await expect(getCurrentCoordinates(silent, 20)).rejects.toMatchObject({ code: "geo_timeout" });
  });
});
