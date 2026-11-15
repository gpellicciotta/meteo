// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Texts show their key, so the tests see which string the app asked for.
const language = vi.hoisted(() => ({ prefix: "t" }));
vi.mock("../js/i18n.js", () => ({ t: (key) => `${language.prefix}:${key}` }));

/**
 * A fake service worker with a state and a message log.
 *
 * @param {string} state - Worker state, such as "installed".
 * @returns {EventTarget & {state: string, postMessage: Function}} Worker.
 */
function fakeWorker(state) {
  return Object.assign(new EventTarget(), { state, postMessage: vi.fn() });
}

/**
 * A fake service worker container whose registration holds the given workers.
 *
 * @param {{controller?: object|null, waiting?: object|null, installing?: object|null}} workers - Initial workers.
 * @returns {{container: EventTarget, registration: EventTarget}} Container and its registration.
 */
function fakeContainer({ controller = null, waiting = null, installing = null } = {}) {
  const registration = Object.assign(new EventTarget(), { waiting, installing, update: vi.fn(async () => {}) });
  const container = Object.assign(new EventTarget(), {
    controller,
    register: vi.fn(async () => registration),
    getRegistration: vi.fn(async () => registration),
  });
  return { container, registration };
}

/**
 * Load the real page and a fresh copy of pwa.js, with the given service worker container.
 *
 * @param {EventTarget} container - Fake navigator.serviceWorker.
 * @returns {Promise<object>} The pwa.js module.
 */
async function loadPwa(container) {
  const html = readFileSync(join(ROOT, "index.html"), "utf-8").replace(/<link[^>]*>|<script[\s\S]*?<\/script>/g, "");
  document.documentElement.innerHTML = html.replace(/^[\s\S]*?<html[^>]*>/, "").replace(/<\/html>[\s\S]*$/, "");
  Object.defineProperty(navigator, "serviceWorker", { value: container, configurable: true });
  vi.resetModules();
  return import("../js/pwa.js");
}

/**
 * Let pending promise callbacks run.
 *
 * @returns {Promise<void>} Resolves after the microtask queue drains.
 */
async function settle() {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}

let reload;

beforeEach(() => {
  language.prefix = "t";
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  reload = vi.spyOn(window.location, "reload").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("service worker update toast", () => {
  it.each([false, true])("updates an open toast on language changes, reload=%s", async (updatedElsewhere) => {
    const { container } = fakeContainer({ controller: fakeWorker("activated"), waiting: fakeWorker("installed") });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    if (updatedElsewhere) {
      container.dispatchEvent(new Event("controllerchange"));
    }
    language.prefix = "nl";
    document.dispatchEvent(new CustomEvent("languagechange"));
    expect(document.querySelector(".toast__text").textContent).toBe("nl:pwa.update_ready");
    expect(document.querySelector(".toast button").textContent).toBe(`nl:pwa.update_${updatedElsewhere ? "reload" : "action"}`);
    expect(document.querySelectorAll(".toast")).toHaveLength(1);
  });
  it("shows no toast on the first install", async () => {
    const { container } = fakeContainer({ installing: fakeWorker("installing") });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    expect(container.register).toHaveBeenCalledWith("./sw.js");
    expect(document.querySelectorAll(".toast-region .toast")).toHaveLength(0);
  });

  it("offers one persistent, localized Update toast in the shell's toast region for a waiting worker", async () => {
    const waiting = fakeWorker("installed");
    const { container } = fakeContainer({ controller: fakeWorker("activated"), waiting });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    const toasts = document.querySelectorAll(".app__overlays > .toast-region > .toast");
    expect(toasts).toHaveLength(1);
    expect(toasts[0].querySelector(".toast__text").textContent).toBe("t:pwa.update_ready");
    expect(toasts[0].querySelector("button.button").textContent).toBe("t:pwa.update_action");
    vi.advanceTimersByTime(60 * 60 * 1000);
    expect(document.querySelectorAll(".toast-region .toast")).toHaveLength(1);
  });

  it("announces the toast through the vendored polite live region", async () => {
    const { container } = fakeContainer({ controller: fakeWorker("activated"), waiting: fakeWorker("installed") });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    vi.advanceTimersByTime(200);
    expect(document.querySelector("[data-live-region='polite']").textContent).toBe("t:pwa.update_ready");
  });

  it("activates the waiting worker on Update and reloads once it takes control", async () => {
    const waiting = fakeWorker("installed");
    const { container } = fakeContainer({ controller: fakeWorker("activated"), waiting });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    document.querySelector(".toast-region .toast button").click();
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: "skip-waiting" });
    expect(reload).not.toHaveBeenCalled();
    container.dispatchEvent(new Event("controllerchange"));
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("never reloads by itself when another tab activates the update", async () => {
    const { container } = fakeContainer({ controller: fakeWorker("activated") });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    container.dispatchEvent(new Event("controllerchange"));
    expect(reload).not.toHaveBeenCalled();
    expect(document.querySelector(".toast-region .toast button").textContent).toBe("t:pwa.update_reload");
  });

  it("keeps checking for updates at start and every minute", async () => {
    const { container, registration } = fakeContainer({ controller: fakeWorker("activated") });
    const pwa = await loadPwa(container);
    await pwa.registerServiceWorker();
    await settle();
    expect(registration.update).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60 * 1000);
    await settle();
    expect(registration.update).toHaveBeenCalledTimes(2);
  });
});

describe("offline banner", () => {
  it("shows while the browser is offline and hides once it is back online", async () => {
    const { container } = fakeContainer();
    const pwa = await loadPwa(container);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    pwa.updateOnlineStatus();
    expect(document.querySelector("#offline-indicator.banner").hidden).toBe(false);
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    pwa.updateOnlineStatus();
    expect(document.querySelector("#offline-indicator").hidden).toBe(true);
  });
});

describe("app icons", () => {
  it("carry the app-icon class, never the vendored icon class that resizes them", async () => {
    const { createIcon } = await import("../js/icons.js");
    const svg = createIcon("search", { width: 18, height: 18 });
    expect([...svg.classList]).toEqual(["app-icon", "icon-search"]);
  });
});
