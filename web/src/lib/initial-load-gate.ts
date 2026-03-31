function setDocumentLoadingState(isLoading: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-preloader", isLoading ? "1" : "0");
  root.setAttribute("data-app-visible", isLoading ? "0" : "1");
}

const INITIAL_PRELOADER_BOOTSTRAP_SCRIPT = `
(() => {
  try {
    const root = document.documentElement;
    root.setAttribute("data-preloader", "1");
    root.setAttribute("data-app-visible", "0");
  } catch (_) {
    document.documentElement.setAttribute("data-preloader", "1");
    document.documentElement.setAttribute("data-app-visible", "0");
  }
})();
`;

export { INITIAL_PRELOADER_BOOTSTRAP_SCRIPT, setDocumentLoadingState };
