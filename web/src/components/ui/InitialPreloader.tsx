"use client";

import { type TransitionEvent, useCallback, useEffect, useRef, useState } from "react";

const FADE_OUT_MS = 320;
const FADE_WATCHDOG_MS = FADE_OUT_MS + 160;

type PreloaderPhase = "visible" | "fadingOut" | "hidden";

function setDocumentLoadingState(isLoading: boolean) {
  const root = document.documentElement;
  root.setAttribute("data-preloader", isLoading ? "1" : "0");
  root.setAttribute("data-app-visible", isLoading ? "0" : "1");
}

export default function InitialPreloader() {
  const [phase, setPhase] = useState<PreloaderPhase>("visible");
  const finalizedRef = useRef(false);
  const watchdogRef = useRef<number | null>(null);
  const rafOneRef = useRef<number | null>(null);
  const rafTwoRef = useRef<number | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogRef.current !== null) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = null;
    }
  }, []);

  const finalize = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    clearWatchdog();
    setDocumentLoadingState(false);
    setPhase("hidden");
  }, [clearWatchdog]);

  useEffect(() => {
    // Hard reloads render this overlay in server HTML first, so users see it
    // before hydration starts. After hydration, this effect fades it out.
    setDocumentLoadingState(true);

    rafOneRef.current = window.requestAnimationFrame(() => {
      rafTwoRef.current = window.requestAnimationFrame(() => {
        setPhase("fadingOut");
        watchdogRef.current = window.setTimeout(finalize, FADE_WATCHDOG_MS);
      });
    });

    return () => {
      if (rafOneRef.current !== null) window.cancelAnimationFrame(rafOneRef.current);
      if (rafTwoRef.current !== null) window.cancelAnimationFrame(rafTwoRef.current);
      rafOneRef.current = null;
      rafTwoRef.current = null;
      clearWatchdog();
      if (!finalizedRef.current) {
        setDocumentLoadingState(false);
      }
    };
  }, [clearWatchdog, finalize]);

  const onOverlayTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
      if (phase !== "fadingOut") return;
      finalize();
    },
    [finalize, phase],
  );

  if (phase === "hidden") return null;

  return (
    <div
      data-initial-preloader="1"
      data-phase={phase}
      onTransitionEnd={onOverlayTransitionEnd}
      aria-hidden={phase !== "visible"}
      className={[
        "fixed inset-0 z-[10000] flex items-center justify-center",
        "bg-[hsl(var(--bg))] text-[hsl(var(--fg))]",
        "transition-opacity ease-out",
        phase === "fadingOut" ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
    >
      <div className="flex flex-col items-center gap-3 px-6 text-center">
        <span className="inline-block h-9 w-9 animate-pulse rounded-full border-2 border-current border-t-transparent" />
        <p className="text-base font-semibold tracking-wide md:text-lg">Simple Deutsch</p>
      </div>
    </div>
  );
}
