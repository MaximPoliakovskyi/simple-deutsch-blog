"use client";

import { useEffect, useId, useRef, useState } from "react";

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
    // fallback: pick the first different word
    for (let i = 0; i < WORDS.length; i++) {
      if (WORDS[i] !== exclude) {
        idx = i;
        break;
      }
    }
  }
  return WORDS[idx];
}

export default function PreloaderClient() {
  const [mounted, setMounted] = useState(true);
  const [hiding, setHiding] = useState(false);
  const prevOverflowRef = useRef<string | null>(null);

  // Render no static word on the server; use the CSS rotator for SSR-visible
  // words and let the JS flipper initialize on the client. This avoids a
  // visible static first word.
  const initialArr: string[] = [];

  // characters currently displayed (start empty; client will populate)
  const [chars, setChars] = useState<string[]>(() => initialArr.slice());
  const [flips, setFlips] = useState<boolean[]>(() => new Array(initialArr.length).fill(false));
  const charsRef = useRef<string[]>([]);
  const flipsRef = useRef<boolean[]>([]);
  const timeouts = useRef<number[]>([]);
  const id = useId();
  const charKeysRef = useRef<Record<number, string>>({});
  const [jsReady, setJsReady] = useState(false);
  const lastWordRef = useRef<string | null>(null);

  // keep refs in sync
  useEffect(() => {
    charsRef.current = chars;
  }, [chars]);
  useEffect(() => {
    flipsRef.current = flips;
  }, [flips]);

  useEffect(() => {
    let intervalId: number | null = null;
    let hideTimer: number | null = null;
    const FLIP_INTERVAL = 5000; // ms between full flip cycles (slower)
    const QUICK_DELAY = 2500; // ms for the quick follow-up flip
    const HIDE_AFTER = 1500; // ms after load before hiding (reduced to 1.5s)

    function clearAll() {
      // use for-of to avoid returning from forEach callback
      for (const t of timeouts.current) {
        window.clearTimeout(t);
      }
      timeouts.current = [];
    }

    // Disable scroll while the preloader is active. Save previous overflow to restore later.
    const root = document.documentElement;
    try {
      prevOverflowRef.current = root.style.overflow ?? null;
      root.style.overflow = "hidden";
    } catch (_) {}

    function start() {
      const initial = pick();
      lastWordRef.current = initial;
      const arr = Array.from(initial).map((ch) => (ch === " " ? "\u00A0" : ch));
      setChars(arr);
      setFlips(new Array(arr.length).fill(false));
      charsRef.current = arr.slice();
      flipsRef.current = new Array(arr.length).fill(false);

      const flipCycle = () => {
        const next = pick(lastWordRef.current ?? undefined);
        lastWordRef.current = next;
        const prev = charsRef.current.slice();
        const prevLen = prev.length;
        const nextLen = next.length;
        const max = Math.max(prevLen, nextLen);
        const stagger = 70; // ms between letters
        const mid = 200; // ms to swap at mid-flip

        // ensure chars/flips arrays are sized to max to avoid sticking
        setChars((prevState) => {
          const a = prevState.slice();
          while (a.length < max) a.push("");
          return a;
        });
        setFlips((prevState) => {
          const f = prevState.slice();
          while (f.length < max) f.push(false);
          return f;
        });
        // sync refs
        charsRef.current = charsRef.current
          .slice()
          .concat(new Array(Math.max(0, max - charsRef.current.length)).fill(""));
        flipsRef.current = flipsRef.current
          .slice()
          .concat(new Array(Math.max(0, max - flipsRef.current.length)).fill(false));

        // schedule flips per letter sequentially
        for (let i = 0; i < max; i++) {
          const startAt = i * stagger;
          const t1 = window.setTimeout(() => {
            // set flipping true for this letter (use ref update pattern)
            setFlips((prevF) => {
              const cp = prevF.slice();
              cp[i] = true;
              flipsRef.current = cp.slice();
              return cp;
            });

            const swap = window.setTimeout(() => {
              setChars((prevC) => {
                const arr2 = prevC.slice();
                const ch = next[i] ?? "";
                arr2[i] = ch === " " ? "\u00A0" : ch;
                charsRef.current = arr2.slice();
                return arr2;
              });
              // turn flipping off to animate back
              setFlips((prevF) => {
                const cp2 = prevF.slice();
                cp2[i] = false;
                flipsRef.current = cp2.slice();
                return cp2;
              });
            }, mid);
            timeouts.current.push(swap);
          }, startAt);
          timeouts.current.push(t1);
        }
      };

      // run one cycle immediately so words visibly change right away
      flipCycle();
      // run another quick cycle shortly after so users see motion during
      // resource-heavy loads before the regular interval kicks in
      const quick = window.setTimeout(() => flipCycle(), QUICK_DELAY);
      timeouts.current.push(quick);
      // then repeat (slower)
      intervalId = window.setInterval(flipCycle, FLIP_INTERVAL);

      // hide timer is managed separately once the page load completes
      hideTimer = null;
    }

    // Start animating immediately so words update while the page loads.
    start();

    // Start the hide timer only after the 'load' event to ensure words keep
    // updating while resources are still loading. If the page is already
    // loaded, set the timer immediately.
    const ensureHideTimer = () => {
      // clear any existing timer first
      if (hideTimer) window.clearTimeout(hideTimer as number);
      // reveal the JS flipper (hide CSS rotator) when the page has loaded
      setJsReady(true);
      hideTimer = window.setTimeout(() => {
        clearAll();
        // restore page scroll before we hide DOM
        try {
          const prev = prevOverflowRef.current;
          document.documentElement.style.overflow = prev ?? "";
        } catch (_) {}
        setHiding(true);
        window.setTimeout(() => setMounted(false), 600);
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
      clearAll();
      // restore overflow on cleanup in case hide path didn't run
      try {
        const prev = prevOverflowRef.current;
        document.documentElement.style.overflow = prev ?? "";
      } catch (_) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="sd-preloader"
      aria-hidden={false}
      className={`${hiding ? "sd-preloader-hidden" : ""} select-none`}
    >
      {/* CSS-only rotator shown before JS runs; hidden when jsReady === true */}
      <div className={`sd-rotator ${jsReady ? "sd-hidden" : ""}`} aria-hidden={jsReady}>
        {WORDS.slice(0, 8).map((w, idx) => (
          <span key={`rot-${idx}`} className="sd-rotator-word">
            {w}
          </span>
        ))}
      </div>

      {/* JS flipper — hidden initially until jsReady is true to avoid duplicate animation */}
      <div
        suppressHydrationWarning
        className={`sd-preloader-word sd-js-flipper ${jsReady ? "sd-js-active" : "sd-js-hidden"}`}
        aria-live="polite"
      >
        {chars.map((c, i) => {
          // Use deterministic keys based on `useId()` and index so keys are
          // stable across server and client renders. Avoid Math.random here
          // because it causes hydration mismatches.
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
