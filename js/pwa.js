import { el } from "./dom.js";
import { t } from "./i18n.js";
import { createToast } from "../vendor/design/js/toast.js";
import { watchWorkerUpdates } from "../vendor/design/js/sw-update.js";

export let deferredInstallPrompt = null;

/**
 * Synchronize the install button visibility with container modifier classes.
 *
 * @returns {void}
 */
export function syncInstallButtonState() {
  if (el.startMetaActions && el.btnInstall) {
    const isVisible = !el.btnInstall.classList.contains("hidden");
    el.startMetaActions.classList.toggle("has-install-btn", isVisible);
  }
}

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  if (el.btnInstall) {
    el.btnInstall.classList.remove("hidden");
    syncInstallButtonState();
  }
});

if (el.btnInstall) {
  el.btnInstall.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      deferredInstallPrompt = null;
      el.btnInstall.classList.add("hidden");
      syncInstallButtonState();
    }
  });
}

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (el.btnInstall) {
    el.btnInstall.classList.add("hidden");
    syncInstallButtonState();
  }
  console.info("PWA installed successfully.");
});

/**
 * Show or hide the offline indicator based on the current connectivity.
 *
 * @returns {void}
 */
export function updateOnlineStatus() {
  const isOnline = typeof navigator.onLine === "boolean" ? navigator.onLine : true;
  if (el.offlineIndicator) {
    el.offlineIndicator.hidden = isOnline;
  }
}

window.addEventListener("online", () => {
  updateOnlineStatus();
});

window.addEventListener("offline", () => {
  updateOnlineStatus();
});

const SW_UPDATE_CHECK_INTERVAL_MS = 60 * 1000;
let serviceWorkerRegistrationStarted = false;

// Read when a toast shows, so the texts follow the language chosen by then.
const UPDATE_MESSAGES = {
  get ready() {
    return t("pwa.update_ready");
  },
  get action() {
    return t("pwa.update_action");
  },
  get reload() {
    return t("pwa.update_reload");
  },
};

/**
 * Keep --action-bar-size on the body equal to the action bar's height, so toasts stay above it.
 *
 * The shell offsets toasts by its standard bar size, but the start screen's bar is taller.
 *
 * @returns {void}
 */
function trackActionBarSize() {
  if (!el.actionBar || typeof ResizeObserver !== "function") {
    return;
  }
  new ResizeObserver(() => {
    document.body.style.setProperty("--action-bar-size", `${el.actionBar.offsetHeight}px`);
  }).observe(el.actionBar);
}

/**
 * Register the service worker, offer each new version in an Update toast, and keep checking for one.
 *
 * Registration happens at most once. The vendored update watcher shows a persistent toast once a new
 * worker waits; Update activates it and reloads this tab once it takes control (support.webapp ADR-0003).
 * Updates are polled periodically as well as on online, focus, pageshow and visibility events.
 *
 * @returns {Promise<void>|undefined} Resolves once registration finished, or undefined
 *          when service workers are unsupported or registration already started.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || serviceWorkerRegistrationStarted) {
    return;
  }
  serviceWorkerRegistrationStarted = true;

  trackActionBarSize();
  // Startup may run after window.load, so register without waiting for it.
  const sharedToaster = createToast({ region: el.toastRegion });
  // Tag app-owned update messages so their existing nodes follow language changes.
  const toaster = {
    show(message, settings) {
      const dismiss = sharedToaster.show(message, settings);
      const toast = el.toastRegion.lastElementChild;
      toast.querySelector(".toast__text").dataset.i18n = "pwa.update_ready";
      toast.querySelector("button").dataset.i18n = settings.actionLabel === t("pwa.update_reload")
        ? "pwa.update_reload" : "pwa.update_action";
      return dismiss;
    },
  };
  document.addEventListener("languagechange", () => {
    for (const node of el.toastRegion.querySelectorAll("[data-i18n]")) {
      node.textContent = t(node.dataset.i18n);
    }
  });
  return watchWorkerUpdates({ script: "./sw.js", toaster, messages: UPDATE_MESSAGES })
      .then(() => navigator.serviceWorker.getRegistration())
      .then((reg) => {
        if (!reg) {
          return;
        }
        let checking = false;
        /**
         * Ask the browser for a newer service worker, skipping needless checks.
         *
         * @returns {Promise<void>} Resolves once the update check finished or was skipped.
         */
        const checkForUpdate = async () => {
          if (checking || navigator.onLine === false || document.visibilityState === "hidden") {
            return;
          }
          checking = true;
          try {
            await reg.update();
          } catch {
            // Keep the installed version usable; retry on the next trigger.
          } finally {
            checking = false;
          }
        };
        checkForUpdate();
        setInterval(checkForUpdate, SW_UPDATE_CHECK_INTERVAL_MS);
        window.addEventListener("online", checkForUpdate);
        window.addEventListener("focus", checkForUpdate);
        window.addEventListener("pageshow", checkForUpdate);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            checkForUpdate();
          }
        });
      })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });
}
