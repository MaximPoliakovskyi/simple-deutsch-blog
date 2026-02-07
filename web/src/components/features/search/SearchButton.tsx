"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

type OpenMethod = "click" | "keyboard" | undefined;

let isListenerAttached = false;
const openCallbacks = new Set<() => boolean>();

function onGlobalSearchShortcut(e: KeyboardEvent) {
  if (!((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) return;

  for (const tryOpen of openCallbacks) {
    if (tryOpen()) {
      e.preventDefault();
      return;
    }
  }
}

function ensureShortcutListener() {
  if (isListenerAttached || typeof window === "undefined") return;
  window.addEventListener("keydown", onGlobalSearchShortcut);
  isListenerAttached = true;
}

function maybeDetachShortcutListener() {
  if (!isListenerAttached || openCallbacks.size > 0 || typeof window === "undefined") return;
  window.removeEventListener("keydown", onGlobalSearchShortcut);
  isListenerAttached = false;
}

const SearchOverlay = dynamic(() => import("./SearchOverlay"), {
  ssr: false,
  loading: () => null,
});

function preloadSearchOverlay() {
  void import("./SearchOverlay");
}

/** Public button to open the overlay */
export default function SearchButton({
  className = "",
  variant = "default",
  ariaLabel = "Find an article",
}: {
  className?: string;
  variant?: "default" | "icon";
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [openMethod, setOpenMethod] = useState<OpenMethod>(undefined);

  useEffect(() => {
    const openFromKeyboard = () => {
      // Only open from the visible button instance. Multiple SearchButton
      // components are mounted (desktop + mobile), so guard by checking
      // whether this button is actually visible in the layout.
      const btn = buttonRef.current;
      if (!btn) return false;
      // offsetParent is null for display: none (and some other hidden cases).
      const isVisible = btn.offsetParent !== null;
      if (!isVisible) return false;

      preloadSearchOverlay();
      // mark that overlay was opened via keyboard so the overlay can
      // adapt its appearance if desired
      setOpenMethod("keyboard");
      setOpen(true);
      return true;
    };

    openCallbacks.add(openFromKeyboard);
    ensureShortcutListener();

    return () => {
      openCallbacks.delete(openFromKeyboard);
      maybeDetachShortcutListener();
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          preloadSearchOverlay();
          setOpenMethod("click");
          setOpen(true);
        }}
        onFocus={preloadSearchOverlay}
        onMouseEnter={preloadSearchOverlay}
        className={[
          // base layout — pill for default, round for icon
          "flex text-sm focus:outline-none",
          // pill appearance (default) / compact circle (icon)
          variant === "icon"
            ? "items-center justify-center w-9.5 h-9.5 rounded-full p-0"
            : "items-center gap-2 rounded-full px-5 py-2",
          // transitions and micro-interaction (smaller scale for the labeled pill)
          variant === "icon"
            ? "transition transform-gpu duration-200 ease-out hover:scale-[1.03]"
            : "transition transform-gpu duration-200 ease-out hover:scale-[1.02]",
          "shadow-sm hover:shadow-md disabled:opacity-60",
          "cursor-pointer",
          // use shared pill surface token so header/search pills match exactly
          "sd-pill",
          // focus outline
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          className,
        ].join(" ")}
        style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
        aria-label={ariaLabel}
        title={`${ariaLabel} (Ctrl+K)`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M11 4a7 7 0 015.29 11.71l3.5 3.5-1.41 1.41-3.5-3.5A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z"
            fill="currentColor"
          />
        </svg>
        {variant === "default" && <span>{ariaLabel}</span>}
      </button>
      {open && (
        <SearchOverlay
          onClose={() => {
            setOpen(false);
            setOpenMethod(undefined);
          }}
          openMethod={openMethod}
        />
      )}
    </>
  );
}
