"use client";

// ---------------------------------------------------------------------------
// TypewriterWords — extracted from hero.tsx for lazy-loading
//
// Loaded via dynamic(() => import('./typewriter-words')) in hero.tsx so that
// the animation hooks (timers, RAF, resize listener) are code-split into a
// separate chunk and do NOT block the initial-page hydration pass.
// ---------------------------------------------------------------------------

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface TypewriterWordsProps {
  words: string[];
  className?: string;
  containerClassName?: string;
  fallbackWidthCh?: number;
  typeMsPerChar?: number;
  deleteMsPerChar?: number;
  pauseAfterTypeMs?: number;
  pauseAfterDeleteMs?: number;
  showCursor?: boolean;
}

type AnimationPhase = "typing" | "pauseAfterType" | "deleting" | "pauseAfterDelete";

function useMeasureWordWidths(words: string[]) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const [maxWidthPx, setMaxWidthPx] = useState(0);

  const measureWidths = useCallback(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    let maxWidth = 0;

    for (const word of words) {
      measureEl.textContent = word;
      const width = Math.ceil(measureEl.getBoundingClientRect().width);
      if (width > maxWidth) {
        maxWidth = width;
      }
    }

    const finalWidth = maxWidth + 8;
    setMaxWidthPx((previous) => (previous === finalWidth ? previous : finalWidth));
  }, [words]);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      measureWidths();
    });
  }, [measureWidths]);

  useEffect(() => {
    scheduleMeasure();

    if (typeof window === "undefined") return;
    const resizeHandler = () => {
      scheduleMeasure();
    };

    window.addEventListener("resize", resizeHandler);

    const fonts = document.fonts;
    let cancelled = false;
    if (fonts?.ready) {
      void fonts.ready.then(() => {
        if (!cancelled) {
          scheduleMeasure();
        }
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeHandler);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [scheduleMeasure]);

  return { measureRef, maxWidthPx };
}

function useTypewriter({
  words,
  typeMsPerChar = 100,
  deleteMsPerChar = 60,
  pauseAfterTypeMs = 2200,
  pauseAfterDeleteMs = 600,
}: {
  words: string[];
  typeMsPerChar: number;
  deleteMsPerChar: number;
  pauseAfterTypeMs: number;
  pauseAfterDeleteMs: number;
}) {
  const [currentText, setCurrentText] = useState("");
  const currentTextRef = useRef("");
  const currentWordIndexRef = useRef(0);
  const phaseRef = useRef<AnimationPhase>("typing");
  const timeoutRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearTimer();
    currentTextRef.current = "";
    currentWordIndexRef.current = 0;
    phaseRef.current = "typing";
    setCurrentText("");

    if (words.length === 0) {
      return clearTimer;
    }

    const schedule = (delayMs: number) => {
      timeoutRef.current = window.setTimeout(step, delayMs);
    };

    const updateText = (nextText: string) => {
      currentTextRef.current = nextText;
      setCurrentText(nextText);
    };

    const step = () => {
      const currentWord = words[currentWordIndexRef.current] ?? "";
      const displayedText = currentTextRef.current;

      if (phaseRef.current === "typing") {
        if (displayedText.length < currentWord.length) {
          updateText(currentWord.slice(0, displayedText.length + 1));
          schedule(typeMsPerChar);
          return;
        }

        phaseRef.current = "pauseAfterType";
        schedule(pauseAfterTypeMs);
        return;
      }

      if (phaseRef.current === "pauseAfterType") {
        phaseRef.current = "deleting";
        schedule(deleteMsPerChar);
        return;
      }

      if (phaseRef.current === "deleting") {
        if (displayedText.length > 0) {
          updateText(displayedText.slice(0, -1));
          schedule(deleteMsPerChar);
          return;
        }

        phaseRef.current = "pauseAfterDelete";
        schedule(pauseAfterDeleteMs);
        return;
      }

      currentWordIndexRef.current = (currentWordIndexRef.current + 1) % words.length;
      phaseRef.current = "typing";
      schedule(typeMsPerChar);
    };

    schedule(typeMsPerChar);

    return clearTimer;
  }, [clearTimer, deleteMsPerChar, pauseAfterDeleteMs, pauseAfterTypeMs, typeMsPerChar, words]);

  return currentText;
}

const TypewriterWords = memo(function TypewriterWords({
  words,
  className = "",
  containerClassName = "",
  fallbackWidthCh,
  typeMsPerChar = 100,
  deleteMsPerChar = 60,
  pauseAfterTypeMs = 2200,
  pauseAfterDeleteMs = 600,
  showCursor = true,
}: TypewriterWordsProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const currentText = useTypewriter({
    words,
    typeMsPerChar,
    deleteMsPerChar,
    pauseAfterTypeMs,
    pauseAfterDeleteMs,
  });

  const firstWord = words[0] ?? "";
  const displayText = prefersReducedMotion ? firstWord : currentText;

  const { measureRef, maxWidthPx } = useMeasureWordWidths(words);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const longestWord = useMemo(
    () =>
      words.reduce((longest, word) => {
        return word.length > longest.length ? word : longest;
      }, ""),
    [words],
  );

  const stableWidth =
    maxWidthPx > 0
      ? `${maxWidthPx}px`
      : fallbackWidthCh !== undefined
        ? `${fallbackWidthCh}ch`
        : undefined;

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>

      <span
        ref={measureRef}
        className={`absolute ${containerClassName} ${className}`}
        style={{ visibility: "hidden", pointerEvents: "none", left: "-9999px" }}
        aria-hidden="true"
      />

      <span
        className={`relative inline-block whitespace-nowrap align-baseline select-text ${containerClassName} ${className}`}
        style={{
          width: stableWidth,
          minWidth: stableWidth,
          verticalAlign: "baseline",
          userSelect: "text",
          WebkitUserSelect: "text",
        }}
        aria-hidden="true"
      >
        <span className="invisible inline-block pointer-events-none select-none">
          {longestWord || "\u00A0"}
        </span>

        <span className="pointer-events-auto absolute inset-0 select-text">
          <span className="absolute top-0 left-1/2 inline-flex -translate-x-1/2 items-baseline whitespace-nowrap transform-gpu">
            <span className="inline-block select-text">{displayText || "\u00A0"}</span>
            {showCursor && !prefersReducedMotion ? (
              <span
                className="caret-realistic ml-px inline-block leading-none pointer-events-none select-none"
                aria-hidden="true"
              >
                |
              </span>
            ) : null}
          </span>
        </span>
      </span>
    </>
  );
});

TypewriterWords.displayName = "TypewriterWords";

export default TypewriterWords;
