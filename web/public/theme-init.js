// Optimized theme init - runs synchronously before first paint
(() => {
  try {
    const ls = localStorage.getItem("sd-theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = ls || (systemDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (_) {}
})();
