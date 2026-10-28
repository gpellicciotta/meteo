import { el } from "./dom.js";
import { drainReportQueue } from "./report-queue.js";

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
    el.offlineIndicator.classList.toggle("hidden", isOnline);
  }
}

window.addEventListener("online", () => {
  updateOnlineStatus();
  drainReportQueue();
});

window.addEventListener("offline", () => {
  updateOnlineStatus();
});

const SW_UPDATE_CHECK_INTERVAL_MS = 60 * 1000;
let serviceWorkerRegistrationStarted = false;

/**
 * Register the service worker and keep it up to date.
 *
 * Registration happens at most once. Once a replacement worker takes control the
 * page reloads so open tabs pick up the new assets, and updates are polled
 * periodically as well as on online, focus, pageshow and visibility events.
 *
 * @returns {Promise<void>|undefined} Resolves once registration finished, or undefined
 *          when service workers are unsupported or registration already started.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || serviceWorkerRegistrationStarted) {
    return;
  }
  serviceWorkerRegistrationStarted = true;

  // Reload once the new worker takes control, so open tabs (installed PWA
  // included) pick up the updated assets without a manual close/reopen.
  let refreshingAfterUpdate = false;
  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // The first installation needs no reload; subsequent replacements do.
    if (!hadController) {
      hadController = Boolean(navigator.serviceWorker.controller);
      return;
    }
    if (refreshingAfterUpdate) {
      return;
    }
    refreshingAfterUpdate = true;
    window.location.reload();
  });

  // Startup may run after window.load, so register without waiting for it.
  return navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then((reg) => {
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (worker) {
            worker.addEventListener("statechange", () => {
              if (worker.state === "installed" && navigator.serviceWorker.controller) {
                console.info("New version of the quiz available, activating automatically.");
              }
            });
          }
        });

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
