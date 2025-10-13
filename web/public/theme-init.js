(() => {
  try {
    const ls = localStorage.getItem("sd-theme"); // 'dark' | 'light' | null
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = ls ? ls : systemDark ? "dark" : "light";
    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  } catch (_) {}
})();
