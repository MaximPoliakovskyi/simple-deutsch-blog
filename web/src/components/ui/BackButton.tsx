"use client";

import { useEffect, useRef, useState } from "react";

const SCROLL_THRESHOLD = 600; // appear after a longer scroll

export default function BackButton() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);
  const desiredVisible = useRef(false);

  useEffect(() => {
    function onScroll() {
      desiredVisible.current = window.scrollY > SCROLL_THRESHOLD;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          setVisible(desiredVisible.current);
          ticking.current = false;
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    if (typeof window === "undefined") return;
    // Always scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const baseClasses =
    "fixed bottom-8 right-6 z-50 flex items-center justify-center rounded-full p-0 focus:outline-none";

  // Reuse the exact class string used by the `En` language button so visuals match.
  // (copied from Navigation.tsx: LanguageDropdown button)
  const enButtonClasses =
    "flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm transition transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-md focus:outline-none focus-visible:outline-none cursor-pointer sd-pill";

  return (
    <button
      aria-label="Back"
      onClick={handleClick}
      className={baseClasses + " " + enButtonClasses}
      // Match `En` button accessibility and focus styling (same padding + outlineColor)
      style={{
        padding: 0,
        outlineColor: "oklch(0.371 0 0)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: "transform .18s ease-out, opacity .14s ease-out",
      }}
      title="Zurück"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M6 15 L12 9 L18 15"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
