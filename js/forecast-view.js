import { el } from "./dom.js";
import { t, getLang } from "./i18n.js";
import { getStoredPreferences, setStoredPreferences } from "./preferences.js";
import { barScaleMax, formatPlace, summarizeRain } from "./forecast.js";
import { fetchForecast, searchPlaces } from "./weather-api.js";
import { getCurrentCoordinates } from "./geolocation.js";

const view = {
  // The place shown: {kind: "place", label} or {kind: "coords"}, plus latitude and longitude.
  place: null,
  forecast: null,
  updatedAt: null,
  choices: [],
  // Incremented per user action so late answers of an older request are ignored.
  requestId: 0,
};

/**
 * Format a number for the active language.
 *
 * @param {number} value - Number to format.
 * @param {number} digits - Fraction digits to show.
 * @returns {string} Localized number.
 */
function formatNumber(value, digits) {
  return new Intl.NumberFormat(getLang(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
}

/**
 * Show a status line such as "Searching...", or hide it.
 *
 * @param {string|null} key - String key of the status, or null to hide it.
 * @returns {void}
 */
function setStatus(key) {
  el.forecastStatus.textContent = key ? t(key) : "";
  el.forecastStatus.classList.toggle("hidden", !key);
}

/**
 * Show an error message, or hide it.
 *
 * @param {string|null} message - Translated message, or null to hide it.
 * @returns {void}
 */
function setError(message) {
  el.startError.textContent = message || "";
  el.startError.classList.toggle("hidden", !message);
}

/**
 * Translate a coded error into a user message.
 *
 * @param {Error & {code?: string}} err - Error raised by the API or geolocation modules.
 * @returns {string} Translated message.
 */
function errorMessage(err) {
  const key = `forecast.error_${err && err.code}`;
  const text = t(key);
  return text === key ? t("forecast.error_network") : text;
}

/**
 * Return the heading of the place currently shown.
 *
 * @returns {string} Place label, or the rounded coordinates for the current location.
 */
function placeLabel() {
  if (view.place.kind === "coords") {
    const coords = `${view.place.latitude.toFixed(2)}, ${view.place.longitude.toFixed(2)}`;
    return t("forecast.current_location", { coords });
  }
  return view.place.label;
}

/**
 * Render the list of matching places to choose from.
 *
 * @returns {void}
 */
function renderChoices() {
  el.placeList.replaceChildren();
  for (const place of view.choices) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "place-choice";
    button.textContent = formatPlace(place);
    button.addEventListener("click", () => {
      showPlaceChoices([]);
      el.locationInput.value = place.name;
      loadForecast({ kind: "place", label: formatPlace(place), latitude: place.latitude, longitude: place.longitude });
    });
    item.append(button);
    el.placeList.append(item);
  }
}

/**
 * Show or clear the place choices.
 *
 * @param {Array<object>} places - Geocoding matches, or an empty list to hide the choices.
 * @returns {void}
 */
function showPlaceChoices(places) {
  view.choices = places;
  renderChoices();
  el.placeChoices.classList.toggle("hidden", places.length === 0);
}

/**
 * Build one column of the rain chart.
 *
 * @param {{label: string, temperature: number|null, precipitation: number|null, probability: number|null}} hour - Forecast hour.
 * @param {number} scaleMax - Rain amount drawn as a full-height bar.
 * @returns {HTMLLIElement} Chart column.
 */
function buildHourColumn(hour, scaleMax) {
  const rain = hour.precipitation || 0;
  const amount = hour.precipitation === null ? "–" : formatNumber(rain, 1);
  const chance = hour.probability === null ? t("forecast.chance_unknown") : `${hour.probability}%`;
  const temperature = hour.temperature === null ? "–" : formatNumber(hour.temperature, 0);

  const item = document.createElement("li");
  item.className = "forecast-hour";
  item.classList.toggle("is-wet", rain >= 0.1);
  item.setAttribute("aria-label", t("forecast.hour_aria", { time: hour.label, amount, chance, temp: temperature }));

  const parts = [
    ["forecast-amount", rain >= 0.05 ? amount : ""],
    ["forecast-bar-track", ""],
    ["forecast-chance", hour.probability === null ? "" : chance],
    ["forecast-time", hour.label],
    ["forecast-temp", hour.temperature === null ? "–" : `${temperature}°`],
  ];
  for (const [className, text] of parts) {
    const span = document.createElement("span");
    span.className = className;
    span.setAttribute("aria-hidden", "true");
    span.textContent = text;
    item.append(span);
  }
  const bar = document.createElement("span");
  bar.className = "forecast-bar";
  bar.style.height = `${Math.min(100, (rain / scaleMax) * 100)}%`;
  item.querySelector(".forecast-bar-track").append(bar);
  return item;
}

/**
 * Render the forecast of the current place: heading, summary and chart.
 *
 * @returns {void}
 */
function renderForecast() {
  if (!view.place || !view.forecast) {
    el.forecast.classList.add("hidden");
    return;
  }
  const { hours } = view.forecast;
  const rain = summarizeRain(hours);
  const temperatures = hours.map((h) => h.temperature).filter((v) => v !== null);
  const sentences = [
    rain.firstRainLabel
      ? t("forecast.summary_rain", { time: rain.firstRainLabel, max: formatNumber(rain.maxPrecipitation, 1) })
      : t("forecast.summary_dry"),
  ];
  if (temperatures.length) {
    sentences.push(t("forecast.summary_temp", {
      min: formatNumber(Math.min(...temperatures), 0),
      max: formatNumber(Math.max(...temperatures), 0),
    }));
  }

  el.forecastPlace.textContent = placeLabel();
  el.forecastUpdated.textContent = t("forecast.updated", {
    time: view.updatedAt.toLocaleTimeString(getLang(), { hour: "2-digit", minute: "2-digit" }),
  });
  el.forecastSummary.textContent = sentences.join(" ");
  el.forecastSummary.classList.toggle("is-wet", Boolean(rain.firstRainLabel));

  const scaleMax = barScaleMax(hours);
  el.forecastChart.replaceChildren(...hours.map((hour) => buildHourColumn(hour, scaleMax)));
  el.forecast.classList.remove("hidden");
}

/**
 * Fetch and show the forecast for a place, remembering it for the next visit.
 *
 * @param {{kind: string, label?: string, latitude: number, longitude: number}} place - Place to show.
 * @returns {Promise<void>} Resolves once the forecast or an error is shown.
 */
async function loadForecast(place) {
  const requestId = ++view.requestId;
  setError(null);
  setStatus("forecast.status_loading");
  try {
    const forecast = await fetchForecast(place.latitude, place.longitude);
    if (requestId !== view.requestId) {
      return;
    }
    Object.assign(view, { place, forecast, updatedAt: new Date() });
    setStoredPreferences({ lastPlace: place });
    renderForecast();
  }
  catch (err) {
    if (requestId === view.requestId) {
      setError(errorMessage(err));
    }
  }
  finally {
    if (requestId === view.requestId) {
      setStatus(null);
    }
  }
}

/**
 * Search the typed place and show its forecast, or the matches to choose from.
 *
 * @param {string} query - Place name or postal code.
 * @returns {Promise<void>} Resolves once the result is shown.
 */
async function searchAndShow(query) {
  const trimmed = query.trim();
  showPlaceChoices([]);
  if (!trimmed) {
    setError(t("forecast.error_empty"));
    return;
  }
  const requestId = ++view.requestId;
  setError(null);
  setStatus("forecast.status_searching");
  try {
    const places = await searchPlaces(trimmed, getLang());
    if (requestId !== view.requestId) {
      return;
    }
    setStatus(null);
    if (places.length === 0) {
      setError(t("forecast.error_not_found", { query: trimmed }));
    }
    else if (places.length === 1) {
      await loadForecast({ kind: "place", label: formatPlace(places[0]), latitude: places[0].latitude, longitude: places[0].longitude });
    }
    else {
      showPlaceChoices(places);
    }
  }
  catch (err) {
    if (requestId === view.requestId) {
      setStatus(null);
      setError(errorMessage(err));
    }
  }
}

/**
 * Show the forecast for the device position.
 *
 * @returns {Promise<void>} Resolves once the forecast or an error is shown.
 */
async function showCurrentLocation() {
  const requestId = ++view.requestId;
  showPlaceChoices([]);
  setError(null);
  setStatus("forecast.status_locating");
  try {
    const { latitude, longitude } = await getCurrentCoordinates();
    if (requestId === view.requestId) {
      await loadForecast({ kind: "coords", latitude, longitude });
    }
  }
  catch (err) {
    if (requestId === view.requestId) {
      setStatus(null);
      setError(errorMessage(err));
    }
  }
}

/**
 * Wire the search form and the current-location button, and show the first forecast.
 *
 * A `?location=` query parameter is searched first; otherwise the last place is reloaded.
 *
 * @returns {void}
 */
export function initForecastView() {
  el.locationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchAndShow(el.locationInput.value);
  });
  el.btnCurrentLocation.addEventListener("click", showCurrentLocation);
  document.addEventListener("languagechange", renderForecast);

  const query = new URLSearchParams(window.location.search).get("location");
  const lastPlace = getStoredPreferences().lastPlace;
  if (query) {
    el.locationInput.value = query;
    searchAndShow(query);
  }
  else if (lastPlace && typeof lastPlace.latitude === "number" && typeof lastPlace.longitude === "number") {
    loadForecast(lastPlace);
  }
}
