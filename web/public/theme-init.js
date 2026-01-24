// Optimized theme init - runs synchronously before first paint
(function() {
  try {
    var ls = localStorage.getItem("sd-theme");
    var systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = ls || (systemDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (_) {}
})();
