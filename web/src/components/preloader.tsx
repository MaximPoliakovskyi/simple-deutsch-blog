"use client";

import {
  type MutableRefObject,
  type TransitionEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { setDocumentLoadingState } from "@/lib/i18n";
import { lockScroll, unlockScroll } from "@/lib/scroll";

const FADE_OUT_MS = 320;
const QUOTE_HOLD_MS = 850;
const QUOTE_FADE_MS = 220;

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

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = arr.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function prefersReducedMotionNow() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function clearTimer(ref: MutableRefObject<number | null>) {
  if (ref.current !== null) {
    window.clearTimeout(ref.current);
    ref.current = null;
  }
}

function PreloaderUI({ onFinished }: { onFinished?: () => void } = {}) {
  const [overlayPhase, setOverlayPhase] = useState<"visible" | "fadingOut">("visible");
  const [showPreloader, setShowPreloader] = useState(true);
  const [quoteState, setQuoteState] = useState<{ text: string; visible: boolean } | null>(null);

  const fadeStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const fadeWatchdogRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimer(fadeWatchdogRef);
    clearTimer(cycleTimerRef);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      unlockScroll();
    } catch {}
    document.documentElement.setAttribute("data-preloader", "0");
    document.documentElement.setAttribute("data-app-visible", "1");
    onFinished?.();
    setShowPreloader(false);
  }, [onFinished]);

  const startFadeOut = useCallback(() => {
    if (fadeStartedRef.current) return;
    fadeStartedRef.current = true;
    clearTimer(cycleTimerRef);
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    setQuoteState((prev) => (prev ? { ...prev, visible: false } : null));
    window.setTimeout(() => {
      setOverlayPhase("fadingOut");
    }, QUOTE_FADE_MS);
    fadeWatchdogRef.current = window.setTimeout(finishPreloader, QUOTE_FADE_MS + FADE_OUT_MS + 250);
  }, [finishPreloader]);

  useEffect(() => {
    try {
      lockScroll();
    } catch {}

    const shuffled = shuffleArray(QUOTES);
    const idx = 0;

    const showNextQuote = () => {
      if (fadeStartedRef.current || finishedRef.current) return;

      const text = shuffled[idx];
      setQuoteState({ text, visible: false });

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          if (fadeStartedRef.current || finishedRef.current) return;

          setQuoteState({ text, visible: true });
          cycleTimerRef.current = window.setTimeout(() => {
            if (fadeStartedRef.current || finishedRef.current) return;
            startFadeOut();
          }, QUOTE_HOLD_MS);
        });
      });
    };

    showNextQuote();

    return () => {
      clearTimer(fadeWatchdogRef);
      clearTimer(cycleTimerRef);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
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
      if (overlayPhase !== "fadingOut") return;
      finishPreloader();
    },
    [finishPreloader, overlayPhase],
  );

  const handleTransitionCancel = useCallback(
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
      onTransitionCancel={handleTransitionCancel}
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

  useEffect(() => {
    setDocumentLoadingState(true);
  }, []);

  const handleFinished = useCallback(() => {
    setDocumentLoadingState(false);
    setShouldRender(false);
  }, []);

  if (!shouldRender) return null;

  return <PreloaderUI onFinished={handleFinished} />;
}
