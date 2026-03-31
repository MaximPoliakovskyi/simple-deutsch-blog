"use client";

import {
  type MutableRefObject,
  type TransitionEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { setDocumentLoadingState } from "@/lib/initial-load-gate";
import { lockScroll, unlockScroll } from "@/lib/scroll";

// ---------------------------------------------------------------------------
// PreloaderUI — animation engine (formerly preloader-client.tsx)
// ---------------------------------------------------------------------------

const FADE_OUT_MS = 320;
const FADE_OUT_WATCHDOG_MS = FADE_OUT_MS + 150;
const HIDE_AFTER_MS = 1500;
const FLIP_INTERVAL_MS = 820;
const LETTER_STAGGER_MS = 52;
const LETTER_SWAP_MS = 150;
const ROTATION_STEP_MS = 900;

const WORDS = [
  "Weiter so",
  "Gut gemacht",
  "Du schaffst das",
  "Kleiner Schritt",
  "Dranbleiben",
  "Los geht's",
  "Sehr gut",
  "Mutig weiter",
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

function PreloaderUI({ onFinished }: { onFinished?: () => void } = {}) {
  const [phase, setPhase] = useState<"visible" | "fadingOut">("visible");
  const [showPreloader, setShowPreloader] = useState(true);
  const [chars, setChars] = useState<string[]>([]);
  const [flips, setFlips] = useState<boolean[]>([]);
  const [jsReady, setJsReady] = useState(false);
  const fadeStartedRef = useRef(false);
  const finishedRef = useRef(false);
  const hideTimerRef = useRef<number | null>(null);
  const fadeWatchdogRef = useRef<number | null>(null);
  const cycleTimerRef = useRef<number | null>(null);
  const animationTimersRef = useRef<number[]>([]);
  const charsRef = useRef<string[]>([]);
  const lastWordRef = useRef<string | null>(null);
  const id = useId();
  const charKeysRef = useRef<Record<number, string>>({});

  const clearAnimationTimers = useCallback(() => {
    for (const timer of animationTimersRef.current) {
      window.clearTimeout(timer);
    }
    animationTimersRef.current = [];
    clearTimer(cycleTimerRef);
  }, []);

  const finishPreloader = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    clearTimer(hideTimerRef);
    clearTimer(fadeWatchdogRef);
    clearAnimationTimers();

    try {
      unlockScroll();
    } catch {}

    document.documentElement.setAttribute("data-preloader", "0");
    document.documentElement.setAttribute("data-app-visible", "1");
    onFinished?.();
    setShowPreloader(false);
  }, [clearAnimationTimers, onFinished]);

  const startFadeOut = useCallback(() => {
    if (fadeStartedRef.current) return;

    fadeStartedRef.current = true;
    clearAnimationTimers();

    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    setPhase("fadingOut");
    fadeWatchdogRef.current = window.setTimeout(finishPreloader, FADE_OUT_WATCHDOG_MS);
  }, [clearAnimationTimers, finishPreloader]);

  useEffect(() => {
    charsRef.current = chars;
  }, [chars]);

  useEffect(() => {
    try {
      lockScroll();
    } catch {}

    const pickNextWord = (exclude?: string) => {
      if (WORDS.length === 0) return "";
      if (!exclude) return WORDS[0];

      const currentIndex = WORDS.indexOf(exclude);
      if (currentIndex === -1) return WORDS[0];
      return WORDS[(currentIndex + 1) % WORDS.length];
    };

    const setWordImmediately = (word: string) => {
      const nextChars = Array.from(word).map((char) => (char === " " ? "\u00A0" : char));
      charsRef.current = nextChars;
      setChars(nextChars);
      setFlips(new Array(nextChars.length).fill(false));
    };

    const scheduleNextCycle = () => {
      clearTimer(cycleTimerRef);
      cycleTimerRef.current = window.setTimeout(runFlipCycle, FLIP_INTERVAL_MS);
    };

    const runFlipCycle = () => {
      if (fadeStartedRef.current || finishedRef.current) return;

      const nextWord = pickNextWord(lastWordRef.current ?? undefined);
      lastWordRef.current = nextWord;

      const nextChars = Array.from(nextWord).map((char) => (char === " " ? "\u00A0" : char));
      const maxLength = Math.max(charsRef.current.length, nextChars.length);

      setChars((previousChars) => {
        const padded = previousChars.slice();
        while (padded.length < maxLength) padded.push("");
        charsRef.current = padded.slice();
        return padded;
      });
      setFlips((previousFlips) => {
        const padded = previousFlips.slice();
        while (padded.length < maxLength) padded.push(false);
        return padded;
      });

      for (let index = 0; index < maxLength; index += 1) {
        const startDelay = index * LETTER_STAGGER_MS;

        const flipTimer = window.setTimeout(() => {
          setFlips((previousFlips) => {
            const nextFlips = previousFlips.slice();
            nextFlips[index] = true;
            return nextFlips;
          });
        }, startDelay);

        const swapTimer = window.setTimeout(() => {
          setChars((previousChars) => {
            const updatedChars = previousChars.slice();
            updatedChars[index] = nextChars[index] ?? "";
            charsRef.current = updatedChars.slice();
            return updatedChars;
          });
          setFlips((previousFlips) => {
            const nextFlips = previousFlips.slice();
            nextFlips[index] = false;
            return nextFlips;
          });
        }, startDelay + LETTER_SWAP_MS);

        animationTimersRef.current.push(flipTimer, swapTimer);
      }

      scheduleNextCycle();
    };

    const initialWord = pickNextWord();
    lastWordRef.current = initialWord;
    setWordImmediately(initialWord);
    setJsReady(true);
    scheduleNextCycle();

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
      clearAnimationTimers();

      if (!finishedRef.current) {
        try {
          unlockScroll();
        } catch {}
      }
    };
  }, [clearAnimationTimers, startFadeOut]);

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
      className="select-none"
    >
      <div className={`sd-rotator ${jsReady ? "sd-hidden" : ""}`} aria-hidden={jsReady}>
        {WORDS.slice(0, 6).map((word, index) => (
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

      <div
        suppressHydrationWarning
        className={`sd-preloader-word ${jsReady ? "sd-js-active" : "sd-js-hidden"}`}
        aria-live="polite"
      >
        {chars.map((char, index) => {
          let key = charKeysRef.current[index];
          if (!key) {
            key = `${id}-${index}`;
            charKeysRef.current[index] = key;
          }

          return (
            <span key={key} className={`sd-letter ${flips[index] ? "flipping" : ""}`}>
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InitialPreloader — default export (formerly initial-preloader.tsx)
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
