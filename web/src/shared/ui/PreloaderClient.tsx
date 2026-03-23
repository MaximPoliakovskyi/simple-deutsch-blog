"use client";

import {
  type MutableRefObject,
  type TransitionEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { lockScroll, unlockScroll } from "@/shared/lib/scrollLock";

const FADE_OUT_MS = 320;
const FADE_OUT_WATCHDOG_MS = FADE_OUT_MS + 150;
const HIDE_AFTER_MS = 1500;
const ROTATION_STEP_MS = 900;

const WORDS = [
  "Weiter so",
  "Gut gemacht",
  "Du schaffst das",
  "Kleiner Schritt",
  "Dranbleiben",
  "Los geht's",
];

function prefersReducedMotionNow() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;

  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function clearTimer(timerRef: MutableRefObject<number | null>) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export default function PreloaderClient() {
  const [phase, setPhase] = useState<"visible" | "fadingOut">("visible");
  const [showPreloader, setShowPreloader] = useState(true);
  const fadeStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const fadeWatchdogRef = useRef<number | null>(null);

  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    clearTimer(hideTimerRef);
    clearTimer(fadeWatchdogRef);

    try {
      unlockScroll();
    } catch {}

    document.documentElement.setAttribute("data-preloader", "0");
    setShowPreloader(false);
  }, []);

  const startFadeOut = useCallback(() => {
    if (fadeStartedRef.current) return;

    fadeStartedRef.current = true;

    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    setPhase("fadingOut");
    fadeWatchdogRef.current = window.setTimeout(finishPreloader, FADE_OUT_WATCHDOG_MS);
  }, [finishPreloader]);

  useEffect(() => {
    try {
      lockScroll();
    } catch {}

    const scheduleHide = () => {
      clearTimer(hideTimerRef);
      hideTimerRef.current = window.setTimeout(startFadeOut, HIDE_AFTER_MS);
    };

    if (document.readyState === "complete") {
      scheduleHide();
    } else {
      window.addEventListener("load", scheduleHide, { once: true });
    }

    return () => {
      window.removeEventListener("load", scheduleHide);
      clearTimer(hideTimerRef);
      clearTimer(fadeWatchdogRef);

      if (!finishedRef.current) {
        try {
          unlockScroll();
        } catch {}
      }
    };
  }, [startFadeOut]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
      if (phase !== "fadingOut") return;
      finishPreloader();
    },
    [finishPreloader, phase],
  );

  if (!showPreloader) return null;

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Singleton overlay element.
    <div
      id="sd-preloader"
      data-phase={phase}
      style={{ ["--sd-preloader-fade-ms" as string]: `${FADE_OUT_MS}ms` }}
      onTransitionEnd={handleTransitionEnd}
      className="select-none"
    >
      <div
        className="sd-preloader-word sd-rotator"
        style={{ ["--sd-preloader-rotate-ms" as string]: `${WORDS.length * ROTATION_STEP_MS}ms` }}
      >
        {WORDS.map((word, index) => (
          <span
            key={word}
            className="sd-rotator-word"
            style={{
              ["--sd-preloader-word-delay" as string]: `${index * ROTATION_STEP_MS}ms`,
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
