// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

/**
 * Icon-only theme toggle using the same storage key your layout uses ("sd-theme").
 * Works without next-themes; it just flips the 'dark' class on <html>.
 */
export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const ls = localStorage.getItem("sd-theme");
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const dark = ls ? ls === "dark" : mql.matches;
      setIsDark(dark);
    } catch {}
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        title="Toggle theme"
        className="rounded p-2 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60"
      >
        {/* placeholder circle */}
        <div className="h-5 w-5 rounded-full border" />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => {
        const next = !isDark;
        setIsDark(next);
        try {
          const el = document.documentElement;
          if (next) el.classList.add("dark");
          else el.classList.remove("dark");
          localStorage.setItem("sd-theme", next ? "dark" : "light");
        } catch {}
      }}
      className="rounded p-2 hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
    >
      {isDark ? (
        // Moon
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            fill="currentColor"
          />
        </svg>
      ) : (
        // Sun
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4V2m0 20v-2m8-8h2M2 12h2m12.95 6.95l1.41 1.41M4.64 4.64l1.41 1.41m0 11.31l-1.41 1.41m12.31-12.31l1.41-1.41M12 8a4 4 0 100 8 4 4 0 000-8z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
