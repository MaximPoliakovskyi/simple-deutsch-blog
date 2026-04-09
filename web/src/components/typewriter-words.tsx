"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";

export interface TypewriterWordsProps {
  words: string[];
  className?: string;
  containerClassName?: string;
  fallbackWidthCh?: number;
  reserveWidth?: boolean;
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

    schedule(pauseAfterDeleteMs);

    return clearTimer;
  }, [clearTimer, deleteMsPerChar, pauseAfterDeleteMs, pauseAfterTypeMs, typeMsPerChar, words]);

  return currentText;
}

const TypewriterWords = memo(function TypewriterWords({
  words,
  className = "",
  containerClassName = "",
  fallbackWidthCh,
  reserveWidth = true,
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

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const stableWidth =
    reserveWidth && maxWidthPx > 0
      ? `${maxWidthPx}px`
      : reserveWidth && fallbackWidthCh !== undefined
        ? `${fallbackWidthCh}ch`
        : undefined;

  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>

      <span
        ref={measureRef}
        className={`pointer-events-none fixed whitespace-nowrap ${containerClassName} ${className}`}
        style={{ visibility: "hidden", top: 0, left: "-9999px" }}
        aria-hidden="true"
      />

      <span
        className={`relative inline-flex items-baseline whitespace-nowrap align-baseline select-text ${containerClassName} ${className}`}
        style={{
          position: "relative",
          width: stableWidth,
          minWidth: stableWidth,
          verticalAlign: "baseline",
          userSelect: "text",
          WebkitUserSelect: "text",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <span className="inline-block select-text transition-[opacity,filter] duration-200 ease-out">
          {displayText || "\u00A0"}
        </span>
        {showCursor && !prefersReducedMotion ? (
          <span
            className="caret-realistic pointer-events-none select-none"
            aria-hidden="true"
            style={{ position: "absolute", left: "100%", top: 0 }}
          >
            |
          </span>
        ) : null}
      </span>
    </>
  );
});

TypewriterWords.displayName = "TypewriterWords";

export default TypewriterWords;
