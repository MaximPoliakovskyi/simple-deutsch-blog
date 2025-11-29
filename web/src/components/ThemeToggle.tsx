"use client";
import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
    setMounted(true);
  }, []);

  function setTheme(next: Theme, e?: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Match CSS transition duration (ms) and avoid stacking timers when toggling quickly.
    const TRANSITION_MS = 350;

    // Add a short transition class so token-based colors interpolate smoothly.
    if (!prefersReduce) {
      // Clear any existing timers to avoid removing the class too early/late.
      try {
        const existing = (root as any).__sd_theme_timer as number | undefined;
        if (existing) window.clearTimeout(existing);
      } catch (_) {}

      root.classList.add("theme-transition");
    }

    if (next === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    try {
      localStorage.setItem("sd-theme", next);
    } catch {}
    setIsDark(next === "dark");

    // Remove transition class after the CSS duration has elapsed.
    if (!prefersReduce) {
      const t = window.setTimeout(() => {
        try {
          root.classList.remove("theme-transition");
        } catch (_) {}
      }, TRANSITION_MS);
      try {
        (root as any).__sd_theme_timer = t;
      } catch (_) {}
    }
  }

    if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={(e) => setTheme(isDark ? "light" : "dark", e)}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={
        "flex items-center justify-center w-[38px] h-[38px] rounded-full text-sm transition-colors focus:outline-none focus-visible:outline-none " +
        "bg-[#FAFAFA] text-neutral-700 border border-[#E6E7EB] hover:bg-[#dcdde0] " +
        "dark:bg-white/5 dark:text-neutral-200 dark:border-white/10 dark:hover:bg-white/10"
      }
      style={{ padding: 0 }}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
