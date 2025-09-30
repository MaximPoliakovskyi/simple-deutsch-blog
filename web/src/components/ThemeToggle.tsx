// src/components/ThemeToggle.tsx
"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // avoid hydration mismatch
    setMounted(true);
  }, []);

  if (!mounted) {
    // render a non-interactive placeholder to avoid mismatch
    return (
      <button
        type="button"
        className="btn-accent px-3 py-2 text-sm opacity-0"
        aria-hidden="true"
        tabIndex={-1}
      >
        Toggle theme
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn-accent px-3 py-2 text-sm"
      onClick={() => {
        const el = document.documentElement;
        const next = el.classList.toggle("dark") ? "dark" : "light";
        try {
          localStorage.setItem("sd-theme", next);
        } catch {}
      }}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      Toggle theme
    </button>
  );
}
