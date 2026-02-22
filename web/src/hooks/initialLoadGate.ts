const LEGACY_PRELOADER_KEY = "preloader_seen";

function setDocumentLoadingState(isLoading: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-preloader", isLoading ? "1" : "0");
  root.setAttribute("data-app-visible", isLoading ? "0" : "1");
}

function clearLegacyPreloaderSeenFlag() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_PRELOADER_KEY);
  } catch {}
}

const INITIAL_PRELOADER_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const root = document.documentElement;
    // Always start in loading mode on full document loads so the
    // preloader is visible before hydration (first visit + refresh).
    sessionStorage.removeItem("sd_initial_loaded");
    sessionStorage.removeItem("${LEGACY_PRELOADER_KEY}");
    root.setAttribute("data-preloader", "1");
    root.setAttribute("data-app-visible", "0");
  } catch (_) {
    document.documentElement.setAttribute("data-preloader", "1");
    document.documentElement.setAttribute("data-app-visible", "0");
  }
})();
`;

export {
  clearLegacyPreloaderSeenFlag,
  INITIAL_PRELOADER_BOOTSTRAP_SCRIPT,
  setDocumentLoadingState,
};
