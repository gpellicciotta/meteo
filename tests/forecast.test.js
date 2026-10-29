import { describe, expect, it, vi } from "vitest";
import { STALE_AFTER_MS, barScaleMax, displaySettings, formatPlace, isCurrentHour, isStale, parseForecast, placeKey, restoreForecast, searchRowOpen, summarizeRain, summarizeWind, visibleHours, weatherCondition } from "../js/forecast.js";
import { buildForecastUrl, buildReverseUrl, buildSearchUrl, fetchForecast, reversePlace, searchPlaces } from "../js/weather-api.js";
import { getCurrentCoordinates } from "../js/geolocation.js";

/**
 * Build an Open-Meteo style hourly forecast response.
 *
 * @param {number[]} rain - Precipitation per hourly step.
 * @param {object} [overrides] - Extra hourly arrays to replace.
 * @returns {object} Response body as returned by the forecast API.
 */
function forecastResponse(rain, overrides = {}) {
  // Local times as Open-Meteo returns them, starting at 10:00 and running past midnight.
  const time = rain.map((_, i) => new Date(Date.UTC(2026, 9, 28, 10 + i)).toISOString().slice(0, 16));
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

// 25 hourly steps from 10:00 to 10:00 the next day, as requested from Open-Meteo.
const DAY_RAIN = [...RAIN, ...Array(12).fill(0)];

describe("parseForecast", () => {
  it("turns 13 hourly steps into 12 hours with the rain of the following hour", () => {
    const forecast = parseForecast(forecastResponse(RAIN));
    expect(forecast.timezone).toBe("Europe/Brussels");
    expect(forecast.hours).toHaveLength(12);
    expect(forecast.hours[0]).toEqual({ time: "2026-10-28T10:00", label: "10:00", temperature: 10, precipitation: 0, probability: 5, windSpeed: null, windGusts: null, condition: null });
    expect(forecast.hours[4]).toMatchObject({ label: "14:00", temperature: 14, precipitation: 1.2, probability: 25 });
    expect(forecast.hours[11]).toMatchObject({ label: "21:00", precipitation: 0, probability: 60 });
  });

  it("keeps every hour of a longer response", () => {
    const { hours } = parseForecast(forecastResponse(DAY_RAIN));
    expect(hours).toHaveLength(24);
    expect(hours[23]).toMatchObject({ time: "2026-10-29T09:00", label: "09:00", temperature: 33, precipitation: 0 });
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

describe("visibleHours", () => {
  const forecast = parseForecast(forecastResponse(DAY_RAIN));
  const labels = (hours) => hours.map((h) => h.label);

  it("starts at the current hour and returns 12 hours", () => {
    // Brussels is at UTC+1, so 09:20 UTC is 10:20 there.
    const fresh = visibleHours(forecast, new Date("2026-10-28T09:20:00Z"));
    expect(fresh).toHaveLength(12);
    expect(fresh[0]).toBe(forecast.hours[0]);
    const later = visibleHours(forecast, new Date("2026-10-28T12:05:00Z"));
    expect(later).toHaveLength(12);
    expect(labels(later)).toEqual(["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00", "00:00"]);
  });

  it("returns fewer hours when the saved data runs out", () => {
    expect(labels(visibleHours(forecast, new Date("2026-10-29T05:20:00Z")))).toEqual(["06:00", "07:00", "08:00", "09:00"]);
    expect(visibleHours(forecast, new Date("2026-10-30T09:20:00Z"))).toEqual([]);
  });

  it("starts at the first hour when it has not begun yet or the timezone is unusable", () => {
    expect(labels(visibleHours(forecast, new Date("2026-10-28T07:00:00Z")))[0]).toBe("10:00");
    for (const timezone of ["", "Not/AZone"]) {
      expect(visibleHours({ ...forecast, timezone }, new Date("2026-10-29T05:20:00Z"))).toHaveLength(12);
    }
  });
});

describe("placeKey", () => {
  it("uses the place id, or the rounded coordinates for the current location", () => {
    expect(placeKey({ kind: "place", id: 2797656, latitude: 51.05, longitude: 3.71667 })).toBe("2797656");
    expect(placeKey({ kind: "coords", latitude: 50.8503, longitude: 4.3517 })).toBe("50.85,4.35");
  });
});

describe("restoreForecast", () => {
  const forecast = parseForecast(forecastResponse(DAY_RAIN, { weather_code: [61], is_day: [1] }));
  const saved = { placeKey: "2797656", fetchedAt: "2026-10-28T09:20:00.000Z", forecast };

  it("restores a saved forecast of the same place after a storage round trip", () => {
    const restored = restoreForecast(JSON.parse(JSON.stringify(saved)), "2797656");
    expect(restored.forecast).toEqual(forecast);
    expect(restored.fetchedAt).toEqual(new Date("2026-10-28T09:20:00Z"));
  });

  it("ignores the saved forecast of another place", () => {
    expect(restoreForecast(saved, "50.85,4.35")).toBeNull();
  });

  it("ignores a malformed saved forecast without throwing", () => {
    const hour = forecast.hours[0];
    const malformed = [
      undefined, null, "forecast", 42, [], {},
      { ...saved, placeKey: 2797656 },
      { ...saved, fetchedAt: undefined },
      { ...saved, fetchedAt: "yesterday" },
      { ...saved, forecast: null },
      { ...saved, forecast: { ...forecast, timezone: 1 } },
      { ...saved, forecast: { ...forecast, hours: "none" } },
      { ...saved, forecast: { ...forecast, hours: [] } },
      { ...saved, forecast: { ...forecast, hours: [null] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, time: 10 }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, time: "10:00" }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, label: null }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, temperature: "12" }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, windGusts: undefined }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, condition: "rain" }] } },
      { ...saved, forecast: { ...forecast, hours: [{ ...hour, condition: { name: "rain", icon: "weather-hail" } }] } },
    ];
    for (const value of malformed) {
      expect(() => restoreForecast(value, "2797656")).not.toThrow();
      expect(restoreForecast(value, "2797656")).toBeNull();
    }
  });
});

describe("formatPlace", () => {
  it("joins name, region and country without missing or duplicate parts", () => {
    expect(formatPlace({ name: "Gent", admin1: "Flanders", country: "Belgium" })).toBe("Gent, Flanders, Belgium");
    expect(formatPlace({ name: "Brussels", admin1: "Brussels", country: "Belgium" })).toBe("Brussels, Belgium");
    expect(formatPlace({ name: "Monaco", country: "Monaco" })).toBe("Monaco");
  });
});

describe("searchRowOpen", () => {
  it.each(["chosen", "toggled", "rendered"])("opens the row on %s when no forecast is shown", (event) => {
    expect(searchRowOpen(false, event, false)).toBe(true);
    expect(searchRowOpen(true, event, false)).toBe(true);
  });

  it("closes the row once a forecast for a chosen place is shown", () => {
    expect(searchRowOpen(true, "chosen", true)).toBe(false);
    expect(searchRowOpen(false, "chosen", true)).toBe(false);
  });

  it("flips the row with the footer button while a forecast is shown", () => {
    expect(searchRowOpen(false, "toggled", true)).toBe(true);
    expect(searchRowOpen(true, "toggled", true)).toBe(false);
  });

  it("keeps the row as it is on refreshes and language switches", () => {
    expect(searchRowOpen(true, "rendered", true)).toBe(true);
    expect(searchRowOpen(false, "rendered", true)).toBe(false);
  });
});

describe("displaySettings", () => {
  it.each([[{}], [null], [undefined], ["showWind"]])("turns wind off by default for %j", (prefs) => {
    expect(displaySettings(prefs)).toEqual({ showWind: false });
  });

  it("turns wind on only for a stored true", () => {
    expect(displaySettings({ showWind: true })).toEqual({ showWind: true });
    expect(displaySettings({ showWind: "true" })).toEqual({ showWind: false });
    expect(displaySettings({ showWind: 1 })).toEqual({ showWind: false });
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
      + "&hourly=temperature_2m%2Cprecipitation%2Cprecipitation_probability%2Cwind_speed_10m%2Cwind_gusts_10m%2Cweather_code%2Cis_day&forecast_hours=25&timezone=auto",
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
    const forecast = await fetchForecast(50.85, 4.35, fakeFetch(200, forecastResponse(DAY_RAIN)));
    expect(forecast.hours).toHaveLength(24);
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

describe("reversePlace", () => {
  // Nominatim reverse answer for 51.1655, 4.1437, checked on 2026-10-28.
  const SINT_NIKLAAS = {
    name: "Sint-Niklaas",
    address: {
      town: "Sint-Niklaas", municipality: "Sint-Niklaas", county: "Sint-Niklaas",
      state: "Oost-Vlaanderen", postcode: "9100", country: "België", country_code: "be",
    },
  };

  it("builds the documented reverse URL with 3-decimal coordinates and the language", () => {
    expect(buildReverseUrl(51.16549, 4.14372, "nl")).toBe(
      "https://nominatim.openstreetmap.org/reverse?lat=51.165&lon=4.144&format=jsonv2&zoom=10&accept-language=nl",
    );
  });

  it("maps a town answer to its name, province and country", async () => {
    const fetchImpl = fakeFetch(200, SINT_NIKLAAS);
    expect(await reversePlace(51.1655, 4.1437, "nl", fetchImpl)).toEqual({
      name: "Sint-Niklaas", admin1: "Oost-Vlaanderen", country: "België",
    });
    expect(fetchImpl.calls).toEqual([buildReverseUrl(51.1655, 4.1437, "nl")]);
  });

  it("prefers city, then village, and the province before the state", async () => {
    const answer = (address) => reversePlace(0, 0, "en", fakeFetch(200, { name: "Top", address }));
    expect(await answer({ city: "Gent", town: "T", village: "V", province: "East Flanders", state: "Flanders" }))
      .toEqual({ name: "Gent", admin1: "East Flanders", country: "" });
    expect(await answer({ village: "Lochristi", hamlet: "H", county: "Gent", country: "Belgium" }))
      .toEqual({ name: "Lochristi", admin1: "Gent", country: "Belgium" });
    expect(await answer({ state: "Flanders" })).toEqual({ name: "Top", admin1: "Flanders", country: "" });
  });

  it("returns null when no place is found", async () => {
    expect(await reversePlace(0, 0, "en", fakeFetch(200, { error: "Unable to geocode" }))).toBeNull();
    expect(await reversePlace(0, 0, "en", fakeFetch(200, { address: { country: "Belgium" } }))).toBeNull();
  });

  it("maps HTTP and network failures to error codes", async () => {
    await expect(reversePlace(0, 0, "en", fakeFetch(429, {}))).rejects.toMatchObject({ code: "http" });
    const offline = async () => {
      throw new TypeError("Failed to fetch");
    };
    await expect(reversePlace(0, 0, "en", offline)).rejects.toMatchObject({ code: "network" });
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
