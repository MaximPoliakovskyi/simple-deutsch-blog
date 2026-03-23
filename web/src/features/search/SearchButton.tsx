"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { formatTranslation } from "@/shared/i18n/i18n";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import Button from "@/shared/ui/Button";

const SearchOverlay = dynamic(() => import("./SearchOverlay"), {
  ssr: false,
});

let isListenerAttached = false;
const openCallbacks = new Set<() => boolean>();
let searchOverlayModulePromise: Promise<unknown> | null = null;

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

function preloadSearchOverlay() {
  if (searchOverlayModulePromise) return;
  searchOverlayModulePromise = import("./SearchOverlay");
}

export default function SearchButton({
  className = "",
  variant = "default",
  ariaLabel,
}: {
  className?: string;
  variant?: "default" | "icon";
  ariaLabel: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const tooltip = formatTranslation(t("search.shortcutTitle"), { label: ariaLabel });

  useEffect(() => {
    const openFromKeyboard = () => {
      const button = buttonRef.current;
      if (!button) return false;

      const isVisible = button.offsetParent !== null;
      if (!isVisible) return false;

      preloadSearchOverlay();
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
      <Button
        ref={buttonRef}
        aria-label={ariaLabel}
        className={[
          variant === "default"
            ? "h-10 gap-2 rounded-full border-[0.8px] border-transparent bg-white px-5 text-[#404040] shadow-[var(--shadow-sm)]"
            : "h-[38px] w-[38px] rounded-full border-[0.8px] border-transparent bg-white p-0 text-[#404040] shadow-[var(--shadow-sm)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => {
          preloadSearchOverlay();
          setOpen(true);
        }}
        onFocus={preloadSearchOverlay}
        onMouseEnter={preloadSearchOverlay}
        size={variant === "icon" ? "icon" : "md"}
        title={tooltip}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M11 4a7 7 0 015.29 11.71l3.5 3.5-1.41 1.41-3.5-3.5A7 7 0 1111 4zm0 2a5 5 0 100 10 5 5 0 000-10z"
            fill="currentColor"
          />
        </svg>
        {variant === "default" && <span>{ariaLabel}</span>}
      </Button>

      {open && (
        <SearchOverlay
          onClose={() => {
            setOpen(false);
            requestAnimationFrame(() => {
              const button = buttonRef.current;
              if (!button) return;
              try {
                button.focus({ preventScroll: true });
              } catch {
                button.focus();
              }
            });
          }}
        />
      )}
    </>
  );
}
