"use client";

import { type TransitionEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";

const PRELOADER_SEEN_KEY = "preloader_seen";
const FADE_OUT_MS = 320;
const FADE_OUT_WATCHDOG_MS = FADE_OUT_MS + 150;

const WORDS = [
  "Weiter so",
  "Gut gemacht",
  "Du schaffst das",
  "Nicht aufgeben",
  "Konzentriert",
  "Fokussiert",
  "Übung macht den Meister",
  "Kleiner Schritt",
  "Stark",
  "Motiviert",
  "Neugierig",
  "Toll",
  "Großartig",
  "Dranbleiben",
  "Mut",
  "Bravo",
  "Bereit",
  "Weiterlernen",
  "Schritt für Schritt",
  // Additional short/impactful phrases
  "Genial",
  "Perfekt",
  "Klasse",
  "Super",
  "Top",
  "Los geht's",
  "Auf geht's",
  "Sehr gut",
  "Du rockst",
  "Fantastisch",
  "Sauber",
  "Weiter!",
  "Komm schon",
  "Ziel im Blick",
  "Kurz & knapp",
];

function pick(exclude?: string) {
  if (WORDS.length === 0) return "";
  if (!exclude) return WORDS[Math.floor(Math.random() * WORDS.length)];
  if (WORDS.length === 1) return WORDS[0];
  let idx = Math.floor(Math.random() * WORDS.length);
  let tries = 0;
  while (WORDS[idx] === exclude && tries < 10) {
    idx = Math.floor(Math.random() * WORDS.length);
    tries += 1;
  }
  if (WORDS[idx] === exclude) {
    for (let i = 0; i < WORDS.length; i++) {
      if (WORDS[i] !== exclude) {
        idx = i;
        break;
      }
    }
  }
  return WORDS[idx];
}

function shouldShowPreloaderFromSession() {
  if (typeof window === "undefined") return true;

  try {
    // SSR defaults to data-preloader="1"; an inline head script flips this
    // to "0" before paint when the preloader was already seen in this tab.
    if (document.documentElement.getAttribute("data-preloader") === "0") {
      return false;
    }

    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;

    if (nav?.type === "reload") {
      window.sessionStorage.removeItem(PRELOADER_SEEN_KEY);
    }

    return window.sessionStorage.getItem(PRELOADER_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

function prefersReducedMotionNow() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export default function PreloaderClient({ onFinished }: { onFinished?: () => void } = {}) {
  const [showPreloader, setShowPreloader] = useState(true);
  const [phase, setPhase] = useState<"visible" | "fadingOut">("visible");
  const startedRef = useRef(false);
  const fadeStartedRef = useRef(false);
  const finalizedRef = useRef(false);
  const fadeWatchdogRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  // Render no static word on the server; use the CSS rotator for SSR-visible
  // words and let the JS flipper initialize on the client.
  const initialArr: string[] = [];

  const [chars, setChars] = useState<string[]>(() => initialArr.slice());
  const [flips, setFlips] = useState<boolean[]>(() => new Array(initialArr.length).fill(false));
  const charsRef = useRef<string[]>([]);
  const flipsRef = useRef<boolean[]>([]);
  const timeouts = useRef<number[]>([]);
  const id = useId();
  const charKeysRef = useRef<Record<number, string>>({});
  const [jsReady, setJsReady] = useState(false);
  const lastWordRef = useRef<string | null>(null);

  const clearFadeWatchdog = useCallback(() => {
    if (fadeWatchdogRef.current !== null) {
      window.clearTimeout(fadeWatchdogRef.current);
      fadeWatchdogRef.current = null;
    }
  }, []);

  const finishPreloader = useCallback(() => {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    clearFadeWatchdog();
    try {
      unlockScroll();
    } catch {}
    document.documentElement.setAttribute("data-preloader", "0");
    document.documentElement.setAttribute("data-app-visible", "1");
    onFinished?.();
    if (isMountedRef.current) setShowPreloader(false);
  }, [clearFadeWatchdog, onFinished]);

  const startFadeOut = useCallback(() => {
    if (fadeStartedRef.current) return;
    fadeStartedRef.current = true;

    if (prefersReducedMotionNow()) {
      finishPreloader();
      return;
    }

    if (isMountedRef.current) setPhase("fadingOut");
    clearFadeWatchdog();
    fadeWatchdogRef.current = window.setTimeout(() => {
      finishPreloader();
    }, FADE_OUT_WATCHDOG_MS);
  }, [clearFadeWatchdog, finishPreloader]);

  useEffect(() => {
    charsRef.current = chars;
  }, [chars]);

  useEffect(() => {
    flipsRef.current = flips;
  }, [flips]);

  // Track component mount lifecycle
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const shouldShow = shouldShowPreloaderFromSession();
    if (!shouldShow) {
      document.documentElement.setAttribute("data-preloader", "0");
      document.documentElement.setAttribute("data-app-visible", "1");
      onFinished?.();
      if (isMountedRef.current) setShowPreloader(false);
      return;
    }

    try {
      window.sessionStorage.setItem(PRELOADER_SEEN_KEY, "1");
    } catch {}

    let intervalId: number | null = null;
    let hideTimer: number | null = null;
    const FLIP_INTERVAL = 5000;
    const QUICK_DELAY = 2500;
    const HIDE_AFTER = 1500;

    function clearAll() {
      for (const t of timeouts.current) {
        window.clearTimeout(t);
      }
      timeouts.current = [];
    }

    try {
      lockScroll();
    } catch {}

    function start() {
      const initial = pick();
      lastWordRef.current = initial;
      const arr = Array.from(initial).map((ch) => (ch === " " ? "\u00A0" : ch));
      if (isMountedRef.current) setChars(arr);
      if (isMountedRef.current) setFlips(new Array(arr.length).fill(false));
      charsRef.current = arr.slice();
      flipsRef.current = new Array(arr.length).fill(false);

      const flipCycle = () => {
        const next = pick(lastWordRef.current ?? undefined);
        lastWordRef.current = next;
        const prev = charsRef.current.slice();
        const prevLen = prev.length;
        const nextLen = next.length;
        const max = Math.max(prevLen, nextLen);
        const stagger = 70;
        const mid = 200;

        if (isMountedRef.current) {
          setChars((prevState) => {
            const a = prevState.slice();
            while (a.length < max) a.push("");
            return a;
          });
        }
        if (isMountedRef.current) {
          setFlips((prevState) => {
            const f = prevState.slice();
            while (f.length < max) f.push(false);
            return f;
          });
        }

        charsRef.current = charsRef.current
          .slice()
          .concat(new Array(Math.max(0, max - charsRef.current.length)).fill(""));
        flipsRef.current = flipsRef.current
          .slice()
          .concat(new Array(Math.max(0, max - flipsRef.current.length)).fill(false));

        for (let i = 0; i < max; i++) {
          const startAt = i * stagger;
          const t1 = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            setFlips((prevF) => {
              const cp = prevF.slice();
              cp[i] = true;
              flipsRef.current = cp.slice();
              return cp;
            });

            const swap = window.setTimeout(() => {
              if (!isMountedRef.current) return;
              setChars((prevC) => {
                const arr2 = prevC.slice();
                const ch = next[i] ?? "";
                arr2[i] = ch === " " ? "\u00A0" : ch;
                charsRef.current = arr2.slice();
                return arr2;
              });

              if (isMountedRef.current) {
                setFlips((prevF) => {
                  const cp2 = prevF.slice();
                  cp2[i] = false;
                  flipsRef.current = cp2.slice();
                  return cp2;
                });
              }
            }, mid);
            timeouts.current.push(swap);
          }, startAt);
          timeouts.current.push(t1);
        }
      };

      flipCycle();
      const quick = window.setTimeout(() => flipCycle(), QUICK_DELAY);
      timeouts.current.push(quick);
      intervalId = window.setInterval(flipCycle, FLIP_INTERVAL);
      hideTimer = null;
    }

    start();

    const ensureHideTimer = () => {
      if (hideTimer) window.clearTimeout(hideTimer as number);
      if (isMountedRef.current) setJsReady(true);
      hideTimer = window.setTimeout(() => {
        clearAll();
        startFadeOut();
      }, HIDE_AFTER);
    };

    let onLoad: (() => void) | null = null;
    if (document.readyState === "complete") {
      ensureHideTimer();
    } else {
      onLoad = () => ensureHideTimer();
      window.addEventListener("load", onLoad);
    }

    return () => {
      if (onLoad) window.removeEventListener("load", onLoad);
      if (intervalId) window.clearInterval(intervalId);
      if (hideTimer) window.clearTimeout(hideTimer as number);
      clearFadeWatchdog();
      clearAll();
      if (!finalizedRef.current) {
        try {
          unlockScroll();
        } catch {}
      }
    };
  }, [clearFadeWatchdog, onFinished, startFadeOut]);

  const onPreloaderTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget || event.propertyName !== "opacity") return;
      if (phase !== "fadingOut") return;
      finishPreloader();
    },
    [finishPreloader, phase],
  );

  const onPreloaderTransitionCancel = useCallback(
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
      onTransitionEnd={onPreloaderTransitionEnd}
      onTransitionCancel={onPreloaderTransitionCancel}
      aria-hidden={false}
      className="select-none"
    >
      <div className={`sd-rotator ${jsReady ? "sd-hidden" : ""}`} aria-hidden={jsReady}>
        {WORDS.slice(0, 8).map((w) => (
          <span key={`rot-${w}`} className="sd-rotator-word">
            {w}
          </span>
        ))}
      </div>

      <div
        suppressHydrationWarning
        className={`sd-preloader-word sd-js-flipper ${jsReady ? "sd-js-active" : "sd-js-hidden"}`}
        aria-live="polite"
      >
        {chars.map((c, i) => {
          let key = charKeysRef.current[i];
          if (!key) {
            key = `${id}-${i}`;
            charKeysRef.current[i] = key;
          }
          return (
            <span key={key} className={`sd-letter ${flips[i] ? "flipping" : ""}`} data-index={i}>
              {c}
            </span>
          );
        })}
      </div>
    </div>
  );
}
