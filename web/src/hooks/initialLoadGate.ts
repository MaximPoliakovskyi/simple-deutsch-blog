const INITIAL_LOAD_KEY = "sd_initial_loaded";
const LEGACY_PRELOADER_KEY = "preloader_seen";

function setDocumentLoadingState(isLoading: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-preloader", isLoading ? "1" : "0");
  root.setAttribute("data-app-visible", isLoading ? "0" : "1");
}

function hasInitialLoadCompleted() {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INITIAL_LOAD_KEY) === "1";
  } catch {
    return false;
  }
}

function markInitialLoadCompleted() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INITIAL_LOAD_KEY, "1");
  } catch {}
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
    const seen = sessionStorage.getItem("${INITIAL_LOAD_KEY}") === "1";
    const root = document.documentElement;
    if (seen) {
      root.setAttribute("data-preloader", "0");
      root.setAttribute("data-app-visible", "1");
      return;
    }
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
  hasInitialLoadCompleted,
  INITIAL_PRELOADER_BOOTSTRAP_SCRIPT,
  markInitialLoadCompleted,
  setDocumentLoadingState,
};
