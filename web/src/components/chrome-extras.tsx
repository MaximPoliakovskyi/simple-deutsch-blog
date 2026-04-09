"use client";

import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// ChunkErrorRecovery (formerly chunk-error-recovery.tsx)
// ---------------------------------------------------------------------------

const RETRY_KEY = "sd-chunk-reload-attempted";

function isChunkLoadError(reason: unknown) {
  if (!reason) return false;
  const text =
    typeof reason === "string"
      ? reason
      : reason instanceof Error
        ? `${reason.name} ${reason.message}`
        : String(reason);
  return (
    text.includes("ChunkLoadError") ||
    text.includes("Failed to load chunk") ||
    text.includes("/_next/static/chunks/") ||
    text.includes("/_next/static/css/")
  );
}

function hardReloadOnce() {
  try {
    const attempted = sessionStorage.getItem(RETRY_KEY) === "1";
    if (attempted) return;
    sessionStorage.setItem(RETRY_KEY, "1");
    const url = new URL(window.location.href);
    url.searchParams.set("__reload", Date.now().toString());
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("__reload")) {
        url.searchParams.delete("__reload");
        window.history.replaceState({}, "", url.toString());
      } else {
        sessionStorage.removeItem(RETRY_KEY);
      }
    } catch {}

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error ?? event.message)) hardReloadOnce();
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        event.preventDefault();
        hardReloadOnce();
      }
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);
  return null;
}

// ---------------------------------------------------------------------------
// BackButton (formerly back-button.tsx)
// ---------------------------------------------------------------------------

const SCROLL_THRESHOLD = 600;

function BackButton() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);
  const desiredVisible = useRef(false);

  const scrollToTopInstantly = () => {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    html.style.scrollBehavior = previousScrollBehavior;
  };

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

  return (
    <button
      type="button"
      aria-label="Back"
      onClick={scrollToTopInstantly}
      className="fixed bottom-8 right-6 z-50 flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm transform-gpu hover:scale-[1.03] shadow-sm focus:outline-none focus-visible:outline-none cursor-pointer sd-pill"
      style={{
        padding: 0,
        outlineColor: "oklch(0.371 0 0)",
        transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.96)",
        opacity: visible ? 1 : 0,
        transition: "opacity var(--motion-fast) ease-out, transform var(--motion-fast) ease-out",
      }}
      title="Zurück"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden="true"
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

// ---------------------------------------------------------------------------
// DeferredChromeExtras — dynamically imported from locale layout (ssr: false)
// ---------------------------------------------------------------------------

export default function DeferredChromeExtras() {
  return <BackButton />;
}
