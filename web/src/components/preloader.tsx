"use client";

import { type TransitionEvent, useCallback, useEffect, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "@/lib/scroll";

const QUOTE_HOLD_MS = 1600;
const FADE_OUT_MS = 500;
const QUOTE_FADE_MS = 300;

const QUOTES = [
  "Jede Sprache ist ein Schlüssel zu einer neuen Welt",
  "Schritt für Schritt wird der Weg kürzer",
  "Übung macht den Meister",
  "Wer eine Sprache lernt, gewinnt eine Seele",
  "Heute ein Wort, morgen ein Satz",
  "Jeder Fehler bringt dich näher ans Ziel",
  "Sprache öffnet Türen, die kein Schlüssel erreicht",
  "Kleine Fortschritte sind auch Fortschritte",
  "Die beste Zeit anzufangen ist jetzt",
  "Mut steht am Anfang, Glück am Ende",
  "Wissen ist ein Schatz, der überall willkommen ist",
  "Lernen ist wie Rudern gegen den Strom",
];

function prefersReducedMotionNow() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function PreloaderUI({ onFinished }: { onFinished?: () => void }) {
  const [overlayPhase, setOverlayPhase] = useState<"visible" | "fadingOut">("visible");
  const [showPreloader, setShowPreloader] = useState(true);
  const [quoteState, setQuoteState] = useState<{ text: string; visible: boolean } | null>(null);
  const finishedRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    unlockScroll();
    document.documentElement.setAttribute("data-preloader", "0");
    onFinished?.();
    setShowPreloader(false);
  }, [onFinished]);

  useEffect(() => {
    lockScroll();
    return () => {
      // Safety cleanup if component unmounts unexpectedly
      unlockScroll();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    const text = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setQuoteState({ text, visible: false });

    let holdTimer: number | null = null;
    let fadeTimer: number | null = null;
    let watchdogTimer: number | null = null;

    // Show quote on next paint
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setQuoteState({ text, visible: true });

        // Hold briefly, then fade
        holdTimer = window.setTimeout(() => {
          setQuoteState((prev) => (prev ? { ...prev, visible: false } : null));
          fadeTimer = window.setTimeout(() => {
            setOverlayPhase("fadingOut");
            // Watchdog in case transitionend never fires
            watchdogTimer = window.setTimeout(finishPreloader, FADE_OUT_MS + 100);
          }, QUOTE_FADE_MS);
        }, QUOTE_HOLD_MS);
      });
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (holdTimer !== null) window.clearTimeout(holdTimer);
      if (fadeTimer !== null) window.clearTimeout(fadeTimer);
      if (watchdogTimer !== null) window.clearTimeout(watchdogTimer);
    };
  }, [finishPreloader]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
      if (overlayPhase !== "fadingOut") return;
      finishPreloader();
    },
    [finishPreloader, overlayPhase],
  );

  if (!showPreloader) return null;

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: Singleton overlay element.
    <div
      id="sd-preloader"
      data-phase={overlayPhase}
      style={{ ["--sd-preloader-fade-ms" as string]: `${FADE_OUT_MS}ms` }}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="sd-preloader-inner">
        {quoteState !== null && (
          <p
            className={`sd-preloader-quote${quoteState.visible ? " sd-quote-visible" : ""}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {quoteState.text}
          </p>
        )}
        <div className="sd-preloader-bar" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function InitialPreloader() {
  const [shouldRender, setShouldRender] = useState(true);

  const handleFinished = useCallback(() => {
    setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return <PreloaderUI onFinished={handleFinished} />;
}
