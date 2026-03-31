"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// AnalyticsClient (formerly analytics-client.tsx)
// ---------------------------------------------------------------------------

export function AnalyticsClient({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <>
      <Analytics mode="production" />
      <SpeedInsights sampleRate={0.1} />
    </>
  );
}

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
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-6 z-50 flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm transition transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-md focus:outline-none focus-visible:outline-none cursor-pointer sd-pill"
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
// FirstVisitDisclaimer (formerly first-visit-disclaimer.tsx)
// ---------------------------------------------------------------------------

function FirstVisitDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4 md:bottom-6">
      <section
        aria-atomic="true"
        aria-live="polite"
        className="pointer-events-auto w-full max-w-xl rounded-2xl border px-4 py-3 backdrop-blur-sm"
        style={{
          backgroundColor: "var(--sd-surface-elevated)",
          borderColor: "var(--sd-border-strong)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-[color:var(--sd-text)]">
              The site is currently finishing its technical implementation
            </p>
            <p className="mt-1 text-sm leading-5 text-[color:var(--sd-text-muted)]">
              First content will be published in April
            </p>
          </div>
          <button
            aria-label="Dismiss site notice"
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-[color:var(--sd-text-muted)] transition-colors hover:bg-black/5 hover:text-[color:var(--sd-text)] dark:hover:bg-white/10"
            onClick={() => setIsVisible(false)}
            type="button"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DeferredChromeExtras — dynamically imported from locale layout (ssr: false)
// ---------------------------------------------------------------------------

export default function DeferredChromeExtras() {
  return (
    <>
      <FirstVisitDisclaimer />
      <BackButton />
    </>
  );
}
