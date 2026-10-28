import { el } from "./dom.js";
import { t, getLang } from "./i18n.js";
import { getStoredPreferences, setStoredPreferences } from "./preferences.js";
import {
  MIN_SAVED_HOURS, RAIN_THRESHOLD_MM, STRONG_GUST_THRESHOLD_KMH, barScaleMax, formatPlace, isCurrentHour, isStale,
  placeKey, restoreForecast, summarizeRain, summarizeWind, visibleHours,
} from "./forecast.js";
import { fetchForecast, reversePlace, searchPlaces } from "./weather-api.js";
import { getCurrentCoordinates } from "./geolocation.js";
import { createIcon } from "./icons.js";

const view = {
  // The place shown: {kind: "place", id, name, label} or {kind: "coords", label?}, plus latitude and longitude.
  place: null,
  forecast: null,
  updatedAt: null,
  choices: [],
  // Query whose matches are listed in the place choices.
  choicesQuery: "",
  // Status and error as string keys with variables, so they can be re-rendered in another language.
  status: null,
  error: null,
  // Incremented per user action so late answers of an older request are ignored.
  requestId: 0,
  // True while a background refresh runs; user requests in flight show a status instead.
  refreshing: false,
  // Incremented per language switch so only the latest place translation is applied.
  localizeId: 0,
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
 * Render the current status line and error message in the active language.
 *
 * @returns {void}
 */
function renderMessages() {
  el.forecastStatus.textContent = view.status ? t(view.status) : "";
  el.forecastStatus.classList.toggle("hidden", !view.status);
  el.startError.textContent = view.error ? t(view.error.key, view.error.vars) : "";
  el.startError.classList.toggle("hidden", !view.error);
}

/**
 * Show a status line such as "Searching...", or hide it.
 *
 * @param {string|null} key - String key of the status, or null to hide it.
 * @returns {void}
 */
function setStatus(key) {
  view.status = key;
  renderMessages();
}

/**
 * Show an error message, or hide it.
 *
 * @param {string|null} key - String key of the message, or null to hide it.
 * @param {Record<string, string>} [vars] - Values for the message placeholders.
 * @returns {void}
 */
function setError(key, vars = {}) {
  view.error = key ? { key, vars } : null;
  renderMessages();
}

/**
 * Pick the message key for a coded error raised by the API or geolocation modules.
 *
 * @param {Error & {code?: string}} err - Raised error.
 * @returns {string} String key of the message; unknown errors count as network failures.
 */
function errorKey(err) {
  const key = `forecast.error_${err && err.code}`;
  return t(key) === key ? "forecast.error_network" : key;
}

/**
 * Describe a geocoding match as a place to show.
 *
 * @param {{id: number, name: string, latitude: number, longitude: number}} match - Geocoding match.
 * @returns {{kind: string, id: number, name: string, label: string, latitude: number, longitude: number}} Place.
 */
function placeFromMatch(match) {
  return {
    kind: "place",
    id: match.id,
    name: match.name,
    label: formatPlace(match),
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

/**
 * Return the heading of the place currently shown.
 *
 * @returns {string} Place label, or the rounded coordinates for an unnamed current location.
 */
function placeLabel() {
  if (view.place.kind === "coords" && view.place.label) {
    return t("forecast.current_location_named", { place: view.place.label });
  }
  if (view.place.kind === "coords") {
    const coords = `${view.place.latitude.toFixed(2)}, ${view.place.longitude.toFixed(2)}`;
    return t("forecast.current_location", { coords });
  }
  return view.place.label;
}

/**
 * Show or clear the place choices.
 *
 * @param {Array<object>} matches - Geocoding matches, or an empty list to hide the choices.
 * @param {string} [query] - Search text the matches belong to.
 * @returns {void}
 */
function showPlaceChoices(matches, query = "") {
  view.choices = matches;
  view.choicesQuery = query;
  el.placeList.replaceChildren();
  for (const match of matches) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "place-choice";
    button.textContent = formatPlace(match);
    button.addEventListener("click", () => {
      showPlaceChoices([]);
      el.locationInput.value = match.name;
      loadForecast(placeFromMatch(match));
    });
    item.append(button);
    el.placeList.append(item);
  }
  el.placeChoices.classList.toggle("hidden", matches.length === 0);
}

/**
 * Build one column of the rain chart.
 *
 * The visible parts are hidden from assistive technology; a visually hidden sentence
 * describes the whole hour instead.
 *
 * @param {{label: string, temperature: number|null, precipitation: number|null, probability: number|null}} hour - Forecast hour.
 * @param {number} scaleMax - Rain amount drawn as a full-height bar.
 * @param {boolean} isNow - True when the column is the current hour, labeled "Now" instead of its time.
 * @returns {HTMLLIElement} Chart column.
 */
function buildHourColumn(hour, scaleMax, isNow) {
  const rain = hour.precipitation || 0;
  const isWet = rain >= RAIN_THRESHOLD_MM;
  const amount = hour.precipitation === null ? "–" : formatNumber(rain, 1);
  const chance = hour.probability === null ? t("forecast.chance_unknown") : `${hour.probability}%`;
  const temperature = hour.temperature === null ? "–" : formatNumber(hour.temperature, 0);
  const label = isNow ? t("forecast.now") : hour.label;

  const item = document.createElement("li");
  item.className = "forecast-hour";
  item.classList.toggle("is-wet", isWet);
  item.classList.toggle("is-now", isNow);

  const description = document.createElement("span");
  description.className = "sr-only";
  description.textContent = t("forecast.hour_aria", { time: label, amount, chance, temp: temperature });
  item.append(description);

  const parts = [
    ["forecast-amount", isWet ? amount : ""],
    ["forecast-bar-track", ""],
    ["forecast-chance", hour.probability === null ? "" : chance],
    ["forecast-time", label],
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
 * Render the forecast of the current place from the current hour on: heading, summary and chart.
 *
 * @returns {void}
 */
function renderForecast() {
  const hours = view.place && view.forecast ? visibleHours(view.forecast, Date.now()) : [];
  if (hours.length === 0) {
    el.forecast.classList.add("hidden");
    return;
  }
  const rain = summarizeRain(hours);
  const startsNow = isCurrentHour(hours[0].time, view.forecast.timezone, Date.now());
  const rainingNow = startsNow && (hours[0].precipitation || 0) >= RAIN_THRESHOLD_MM;
  const temperatures = hours.map((h) => h.temperature).filter((v) => v !== null);
  const sentences = [
    rainingNow ? t("forecast.summary_rain_now", { max: formatNumber(rain.maxPrecipitation, 1) })
      : rain.firstRainLabel
        ? t("forecast.summary_rain", { time: rain.firstRainLabel, max: formatNumber(rain.maxPrecipitation, 1) })
        : t("forecast.summary_dry"),
  ];
  if (temperatures.length) {
    sentences.push(t("forecast.summary_temp", {
      min: formatNumber(Math.min(...temperatures), 0),
      max: formatNumber(Math.max(...temperatures), 0),
    }));
  }

  const wind = summarizeWind(hours);
  const strongGusts = wind.maxGusts !== null && wind.maxGusts >= STRONG_GUST_THRESHOLD_KMH;
  if (wind.maxSpeed !== null) {
    sentences.push(t(strongGusts ? "forecast.summary_wind_gusts" : "forecast.summary_wind", {
      speed: formatNumber(wind.maxSpeed, 0),
      gusts: strongGusts ? formatNumber(wind.maxGusts, 0) : "",
    }));
  }
  else if (strongGusts) {
    sentences.push(t("forecast.summary_gusts", { gusts: formatNumber(wind.maxGusts, 0) }));
  }

  el.forecastPlace.textContent = placeLabel();
  el.forecastAttributionOsm.classList.toggle("hidden", !(view.place.kind === "coords" && view.place.label));
  el.forecastUpdated.textContent = t("forecast.updated", {
    time: view.updatedAt.toLocaleTimeString(getLang(), { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
  });
  el.forecastSummary.textContent = sentences.join("\n");
  const condition = hours[0].condition;
  if (condition) {
    const icon = createIcon(condition.icon, {
      className: "forecast-condition",
      title: t(`forecast.condition_${condition.name}`),
    });
    icon.removeAttribute("aria-hidden");
    el.forecastSummary.prepend(icon);
  }
  el.forecastSummary.classList.toggle("is-wet", Boolean(rain.firstRainLabel));

  const scaleMax = barScaleMax(hours);
  el.forecastChart.replaceChildren(...hours.map((hour, i) => buildHourColumn(hour, scaleMax, startsNow && i === 0)));
  el.forecast.classList.remove("hidden");
}

/**
 * Fetch and show the forecast for a place, remembering it for the next visit.
 *
 * A quiet load refreshes the shown place in the background and shows no status line.
 * When loading the shown place fails, its chart and update time stay while at least
 * 6 hours of it lie ahead; otherwise the chart is hidden and the error shown.
 *
 * @param {object} place - Place to show, as built by placeFromMatch() or a coordinates place.
 * @param {{quiet?: boolean}} [options] - Set quiet for a background refresh.
 * @returns {Promise<void>} Resolves once the forecast or an error is shown.
 */
async function loadForecast(place, { quiet = false } = {}) {
  const requestId = ++view.requestId;
  if (!quiet) {
    setError(null);
    setStatus("forecast.status_loading");
  }
  try {
    const forecast = await fetchForecast(place.latitude, place.longitude);
    if (requestId !== view.requestId) {
      return;
    }
    // A refresh keeps the shown place, which a language switch may have renamed meanwhile.
    Object.assign(view, { place: quiet ? view.place : place, forecast, updatedAt: new Date() });
    setStoredPreferences({
      lastPlace: view.place,
      lastForecast: { placeKey: placeKey(view.place), fetchedAt: view.updatedAt.toISOString(), forecast },
    });
    renderForecast();
  }
  catch (err) {
    if (requestId !== view.requestId) {
      return;
    }
    const shown = Boolean(view.forecast) && placeKey(view.place) === placeKey(place);
    if (shown && showRemainingHours()) {
      return;
    }
    setError(errorKey(err));
  }
  finally {
    if (requestId === view.requestId && !quiet) {
      setStatus(null);
    }
  }
}

/**
 * Re-render the shown forecast from the current hour on, hiding it below 6 remaining hours.
 *
 * @returns {boolean} True when a forecast is still shown.
 */
function showRemainingHours() {
  if (view.forecast && visibleHours(view.forecast, Date.now()).length < MIN_SAVED_HOURS) {
    view.forecast = null;
  }
  renderForecast();
  return Boolean(view.forecast);
}

/**
 * Bring the shown forecast up to date when the app is shown again.
 *
 * Past hours are dropped even when no refresh runs, such as offline or within 15 minutes.
 * An offline device that drops its last hours shows the network error instead.
 *
 * @returns {void}
 */
function handleResume() {
  const hadForecast = Boolean(view.forecast);
  if (!showRemainingHours() && hadForecast && navigator.onLine === false) {
    setError("forecast.error_network");
  }
  refreshIfStale();
}

/**
 * Fetch the shown forecast again in the background when it has become stale.
 *
 * Skipped without a shown place, while offline, or while a request is in flight.
 * A forecast hidden after a failed refresh is loaded visibly, so its error is replaced.
 *
 * @returns {Promise<void>} Resolves once the refresh is shown, dropped or skipped.
 */
async function refreshIfStale() {
  if (!view.place || !isStale(view.updatedAt, Date.now()) || navigator.onLine === false
    || view.status || view.refreshing) {
    return;
  }
  view.refreshing = true;
  try {
    await loadForecast(view.place, { quiet: Boolean(view.forecast) });
  }
  finally {
    view.refreshing = false;
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
  const requestId = ++view.requestId;
  showPlaceChoices([]);
  setStatus(null);
  if (!trimmed) {
    setError("forecast.error_empty");
    return;
  }
  setError(null);
  setStatus("forecast.status_searching");
  try {
    const matches = await searchPlaces(trimmed, getLang());
    if (requestId !== view.requestId) {
      return;
    }
    setStatus(null);
    if (matches.length === 0) {
      setError("forecast.error_not_found", { query: trimmed });
    }
    else if (matches.length === 1) {
      await loadForecast(placeFromMatch(matches[0]));
    }
    else {
      showPlaceChoices(matches, trimmed);
    }
  }
  catch (err) {
    if (requestId === view.requestId) {
      setStatus(null);
      setError(errorKey(err));
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
      const place = { kind: "coords", latitude, longitude };
      const loading = loadForecast(place);
      // The forecast never waits for the name.
      nameCurrentLocation(place);
      await loading;
    }
  }
  catch (err) {
    if (requestId === view.requestId) {
      setStatus(null);
      setError(errorKey(err));
    }
  }
}

/**
 * Look up the town of a current location place and show it once its forecast is shown.
 *
 * The name is kept while the place still loads as the latest request, or is shown.
 * Failures keep the coordinates without an error message.
 *
 * @param {object} place - Coordinates place passed to loadForecast().
 * @returns {Promise<void>} Resolves once the name is set or dropped.
 */
async function nameCurrentLocation(place) {
  const requestId = view.requestId;
  try {
    const match = await reversePlace(place.latitude, place.longitude, getLang());
    if (!match || (requestId !== view.requestId && view.place !== place)) {
      return;
    }
    place.label = formatPlace(match);
    if (view.place === place) {
      setStoredPreferences({ lastPlace: place });
      renderForecast();
    }
  }
  catch {
    // Keep the coordinates.
  }
}

/**
 * Fetch the name of the shown place in the active language and re-render it.
 *
 * Geocoding returns names in the requested language, so the place is looked up again
 * by name and matched on its id. The current location is looked up again by its position.
 * Failures keep the current name.
 *
 * @returns {Promise<void>} Resolves once the name is updated or kept.
 */
async function localizePlace() {
  const place = view.place;
  const isCoords = place && place.kind === "coords";
  if (!place || (!isCoords && (place.kind !== "place" || !place.id || !place.name))) {
    return;
  }
  const localizeId = ++view.localizeId;
  try {
    const match = isCoords
      ? await reversePlace(place.latitude, place.longitude, getLang())
      : (await searchPlaces(place.name, getLang())).find((m) => m.id === place.id);
    if (!match || localizeId !== view.localizeId || view.place !== place) {
      return;
    }
    view.place = isCoords
      ? { ...place, label: formatPlace(match) }
      : { ...placeFromMatch(match), latitude: place.latitude, longitude: place.longitude };
    setStoredPreferences({ lastPlace: view.place });
    renderForecast();
  }
  catch {
    // Keep the name in the previous language.
  }
}

/**
 * Re-render everything the forecast view shows in the newly active language.
 *
 * @returns {void}
 */
function handleLanguageChange() {
  renderMessages();
  renderForecast();
  localizePlace();
  if (view.choices.length > 0) {
    searchAndShow(view.choicesQuery);
  }
}

/**
 * Show the last saved forecast of a place at once, while at least 6 of its hours lie ahead.
 *
 * The update line keeps the original fetch time, so the saved data is never presented as new.
 *
 * @param {object} place - Last place, as stored by loadForecast().
 * @returns {void}
 */
function showSavedForecast(place) {
  const saved = restoreForecast(getStoredPreferences().lastForecast, placeKey(place));
  if (saved && visibleHours(saved.forecast, Date.now()).length >= MIN_SAVED_HOURS) {
    Object.assign(view, { place, forecast: saved.forecast, updatedAt: saved.fetchedAt });
    renderForecast();
  }
}

/**
 * Wire the search form and the current-location button, and show the first forecast.
 *
 * A `?location=` query parameter is searched first; otherwise the last place is reloaded,
 * showing its saved forecast until the new one arrives.
 *
 * @returns {void}
 */
export function initForecastView() {
  el.locationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchAndShow(el.locationInput.value);
  });
  el.btnCurrentLocation.addEventListener("click", showCurrentLocation);
  document.addEventListener("languagechange", handleLanguageChange);
  // An installed app resumes from memory, and the back-forward cache restores the page, without reloading.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      handleResume();
    }
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      handleResume();
    }
  });

  const query = new URLSearchParams(window.location.search).get("location");
  const lastPlace = getStoredPreferences().lastPlace;
  if (query) {
    el.locationInput.value = query;
    searchAndShow(query);
  }
  else if (lastPlace && typeof lastPlace.latitude === "number" && typeof lastPlace.longitude === "number") {
    showSavedForecast(lastPlace);
    loadForecast(lastPlace);
  }
}
