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

// ---------------------------------------------------------------------------
// PreloaderUI — quote-cycling animation with per-letter stagger
// ---------------------------------------------------------------------------

const FADE_OUT_MS = 600;
const FADE_OUT_WATCHDOG_MS = FADE_OUT_MS + 250;
const LETTER_STAGGER_MS = 30;
const QUOTE_HOLD_MS = 2000;
const QUOTE_FADE_OUT_MS = 400;
const QUOTE_PRE_FADE_MS = 300;

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

type LetterState = { char: string; visible: boolean };
type WordGroup = { letters: LetterState[]; isSpace: boolean };

function PreloaderUI({ onFinished }: { onFinished?: () => void } = {}) {
  const [phase, setPhase] = useState<"visible" | "fadingOut">("visible");
  const [showPreloader, setShowPreloader] = useState(true);
  const [words, setWords] = useState<WordGroup[]>([]);
  const [quoteReady, setQuoteReady] = useState(false);
  const [dismissing, setDismissing] = useState(false);
  const [jsReady, setJsReady] = useState(false);

  const fadeStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const pageLoadedRef = useRef(false);
  const quotesShownRef = useRef(0);
  const fadeWatchdogRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const letterTimersRef = useRef<number[]>([]);

  const clearAllTimers = useCallback(() => {
    clearTimer(cycleTimerRef);
    for (const t of letterTimersRef.current) window.clearTimeout(t);
    letterTimersRef.current = [];
  }, []);

  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimer(fadeWatchdogRef);
    clearAllTimers();

    try {
      unlockScroll();
    } catch {}

    document.documentElement.setAttribute("data-preloader", "0");
    document.documentElement.setAttribute("data-app-visible", "1");
    onFinished?.();
    setShowPreloader(false);
  }, [clearAllTimers, onFinished]);

  const startFadeOut = useCallback(() => {
    if (fadeStartedRef.current) return;
    fadeStartedRef.current = true;
    clearAllTimers();

    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    // Fade out quote first, then fade the whole overlay
    setDismissing(true);
    window.setTimeout(() => {
      setPhase("fadingOut");
    }, QUOTE_PRE_FADE_MS);
    fadeWatchdogRef.current = window.setTimeout(
      finishPreloader,
      QUOTE_PRE_FADE_MS + FADE_OUT_WATCHDOG_MS,
    );
  }, [clearAllTimers, finishPreloader]);

  /** Reveal letters of a quote one by one, then call onComplete after the hold. */
  const revealQuote = useCallback(
    (
      quote: string,
      onComplete: () => void,
    ) => {
      // Split into word groups, preserving spaces as separators
      const rawWords = quote.split(/(\s+)/);
      const groups: WordGroup[] = rawWords.map((seg) => {
        const isSpace = /^\s+$/.test(seg);
        return {
          isSpace,
          letters: Array.from(seg).map((c) => ({ char: isSpace ? "\u00A0" : c, visible: false })),
        };
      });
      setWords(groups);
      setQuoteReady(true);
      setDismissing(false);

      // Build a flat index → (groupIdx, letterIdx) mapping for stagger
      const flatMap: { g: number; l: number }[] = [];
      for (let g = 0; g < groups.length; g++) {
        for (let l = 0; l < groups[g].letters.length; l++) {
          flatMap.push({ g, l });
        }
      }

      // Stagger each letter in
      for (let i = 0; i < flatMap.length; i++) {
        const { g, l } = flatMap[i];
        const timer = window.setTimeout(() => {
          setWords((prev) => {
            const next = prev.map((w) => ({ ...w, letters: w.letters.slice() }));
            if (next[g]?.letters[l]) {
              next[g].letters[l] = { ...next[g].letters[l], visible: true };
            }
            return next;
          });
        }, i * LETTER_STAGGER_MS);
        letterTimersRef.current.push(timer);
      }

      // After all letters revealed + hold time, call onComplete
      const totalRevealMs = flatMap.length * LETTER_STAGGER_MS;
      cycleTimerRef.current = window.setTimeout(() => {
        if (fadeStartedRef.current || finishedRef.current) return;
        onComplete();
      }, totalRevealMs + QUOTE_HOLD_MS);
    },
    [],
  );

  useEffect(() => {
    try {
      lockScroll();
    } catch {}

    const shuffled = shuffleArray(QUOTES);
    let idx = 0;

    setJsReady(true);

    const showQuote = () => {
      if (fadeStartedRef.current || finishedRef.current) return;

      revealQuote(shuffled[idx], () => {
        quotesShownRef.current += 1;

        // Can we dismiss? Page loaded AND at least one full quote shown
        if (pageLoadedRef.current && quotesShownRef.current >= 1) {
          startFadeOut();
          return;
        }

        // Fade out current quote
        setDismissing(true);

        cycleTimerRef.current = window.setTimeout(() => {
          if (fadeStartedRef.current || finishedRef.current) return;
          idx = (idx + 1) % shuffled.length;
          showQuote();
        }, QUOTE_FADE_OUT_MS);
      });
    };

    showQuote();

    const onPageLoad = () => {
      pageLoadedRef.current = true;
    };

    if (document.readyState === "complete") {
      pageLoadedRef.current = true;
    } else {
      window.addEventListener("load", onPageLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", onPageLoad);
      clearTimer(fadeWatchdogRef);
      clearAllTimers();

      if (!finishedRef.current) {
        try {
          unlockScroll();
        } catch {}
      }
    };
  }, [clearAllTimers, revealQuote, startFadeOut]);

  const handleTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
      if (phase !== "fadingOut") return;
      finishPreloader();
    },
    [finishPreloader, phase],
  );

  const handleTransitionCancel = useCallback(
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
      onTransitionCancel={handleTransitionCancel}
    >
      {/* CSS-only fallback rotator (before JS hydrates) */}
      <div className={`sd-quote-rotator ${jsReady ? "sd-hidden" : ""}`} aria-hidden={jsReady}>
        {QUOTES.slice(0, 4).map((quote, i) => (
          <span
            key={quote}
            className="sd-rotator-quote"
            // opacity:0 in HTML ensures text is invisible before CSS loads (FOUC fix).
            // CSS animations override inline styles, so the animation still runs correctly.
            style={{ animationDelay: `${i * 3}s`, opacity: 0 }}
          >
            {quote}
          </span>
        ))}
      </div>

      {/* JS-powered letter-by-letter quote display */}
      <div
        className={`sd-preloader-quote ${jsReady ? "" : "sd-js-hidden"} ${quoteReady ? "sd-quote-ready" : ""} ${dismissing ? "sd-quote-dismiss" : ""}`}
        aria-live="polite"
      >
        <p className="sd-quote-text">
          {words.map((word, wi) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: stable word position
              key={wi}
              className={word.isSpace ? "sd-word-space" : "sd-word"}
            >
              {word.letters.map((l, li) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable letter position
                  key={li}
                  className={`sd-letter ${l.visible ? "sd-letter-in" : ""}`}
                >
                  {l.char}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InitialPreloader — default export
// ---------------------------------------------------------------------------

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
