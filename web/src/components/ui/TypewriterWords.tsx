"use client";

import * as React from "react";

interface TypewriterWordsProps {
  words: string[];
  className?: string;
  containerClassName?: string; // Classes for the outer container (e.g., font and size)
  fallbackWidthCh?: number; // Optional fallback stage width before pixel measurement is ready
  typeMsPerChar?: number;
  deleteMsPerChar?: number;
  pauseAfterTypeMs?: number;
  pauseAfterDeleteMs?: number;
  showCursor?: boolean;
}

/**
 * Custom hook to measure the pixel width of words using a hidden measurement span.
 * Handles responsive font size changes via resize events.
 * Returns the maximum width in pixels and provides a ref for the measurement element.
 */
function useMeasureWordWidths(words: string[]) {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [maxWidthPx, setMaxWidthPx] = React.useState(0);

  const measureWidths = React.useCallback(() => {
    const measureEl = measureRef.current;
    if (!measureEl) return;

    let maxWidth = 0;

    // Measure each word
    words.forEach((word) => {
      measureEl.textContent = word;
      const width = measureEl.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });

    // Add small padding for cursor space
    const finalWidth = maxWidth + 8;
    setMaxWidthPx(finalWidth);
  }, [words]);

  React.useEffect(() => {
    measureWidths();

    // Re-measure on window resize (for responsive font size changes)
    const resizeHandler = () => {
      measureWidths();
    };

    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [measureWidths]);

  return { measureRef, maxWidthPx };
}

/**
 * Hook that manages the typewriter animation state.
 * Returns the current display text.
 *
 * Animation lifecycle per word:
 * 1. Type characters one by one (typeMsPerChar)
 * 2. Pause after typing completes (pauseAfterTypeMs)
 * 3. Delete characters one by one (deleteMsPerChar)
 * 4. Pause after deleting completes (pauseAfterDeleteMs)
 * 5. Move to next word and repeat
 *
 * All timers are properly cleaned up on unmount.
 */
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
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isPausedAfterType, setIsPausedAfterType] = React.useState(false);
  const [isPausedAfterDelete, setIsPausedAfterDelete] = React.useState(false);

  React.useEffect(() => {
    if (words.length === 0) return;

    const currentWord = words[currentWordIndex];

    // Paused after typing - wait before starting to delete
    if (isPausedAfterType) {
      const timeout = setTimeout(() => {
        setIsPausedAfterType(false);
        setIsDeleting(true);
      }, pauseAfterTypeMs);
      return () => clearTimeout(timeout);
    }

    // Paused after deleting - wait before moving to next word
    if (isPausedAfterDelete) {
      const timeout = setTimeout(() => {
        setIsPausedAfterDelete(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, pauseAfterDeleteMs);
      return () => clearTimeout(timeout);
    }

    // Currently deleting
    if (isDeleting) {
      if (currentText.length === 0) {
        // Finished deleting, pause before next word
        setIsDeleting(false);
        setIsPausedAfterDelete(true);
        return;
      }

      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, deleteMsPerChar);
      return () => clearTimeout(timeout);
    }

    // Currently typing
    if (currentText.length < currentWord.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => currentWord.slice(0, prev.length + 1));
      }, typeMsPerChar);
      return () => clearTimeout(timeout);
    }

    // Word fully typed, pause before deleting
    if (currentText.length === currentWord.length) {
      setIsPausedAfterType(true);
    }
  }, [
    words,
    currentWordIndex,
    currentText,
    isDeleting,
    isPausedAfterType,
    isPausedAfterDelete,
    typeMsPerChar,
    deleteMsPerChar,
    pauseAfterTypeMs,
    pauseAfterDeleteMs,
  ]);

  return currentText;
}

/**
 * TypewriterWords component - displays rotating words with a typewriter animation.
 *
 * Features:
 * - Pixel-accurate width measurement to prevent horizontal drift
 * - Absolutely positioned cursor that never wraps
 * - Respects prefers-reduced-motion
 * - Accessibility: aria-hidden on animated text, sr-only label
 * - No layout thrashing: cursor does not participate in flow
 *
 * @example
 * <TypewriterWords
 *   words={["work", "travel", "life"]}
 *   className="text-blue-600"
 *   containerClassName="font-extrabold text-5xl sm:text-6xl md:text-7xl"
 *   fallbackWidthCh={8}
 * />
 */
export default function TypewriterWords({
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
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const currentText = useTypewriter({
    words,
    typeMsPerChar,
    deleteMsPerChar,
    pauseAfterTypeMs,
    pauseAfterDeleteMs,
  });

  // For reduced motion, show the first word statically
  const firstWord = words[0] ?? "";
  const displayText = prefersReducedMotion ? firstWord : currentText;

  // Measure pixel widths of all words
  const { measureRef, maxWidthPx } = useMeasureWordWidths(words);

  // Check for prefers-reduced-motion
  React.useEffect(() => {
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

  const longestWord = React.useMemo(
    () =>
      words.reduce((longest, word) => {
        return word.length > longest.length ? word : longest;
      }, ""),
    [words],
  );

  const widthFallback = Math.max(1, fallbackWidthCh ?? longestWord.length + 0.3);
  const stableWidth = maxWidthPx > 0 ? `${maxWidthPx}px` : `${widthFallback}ch`;

  return (
    <>
      {/* Screen reader only: stable label with all possible values */}
      <span className="sr-only">{words.join(", ")}</span>

      {/* Hidden measurement span: must have same classes as visible text for accurate width */}
      <span
        ref={measureRef}
        className={`absolute ${containerClassName} ${className}`}
        style={{ visibility: "hidden", pointerEvents: "none", left: "-9999px" }}
        aria-hidden="true"
      />

      {/* Stage with fixed width; keeps line centered and stable */}
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
        {/* Invisible sizer keeps the line box height and baseline stable. */}
        <span className="invisible inline-block pointer-events-none select-none">
          {longestWord || "\u00A0"}
        </span>

        {/* Center only the word; keep cursor absolutely positioned so it cannot offset centering. */}
        <span className="pointer-events-auto absolute inset-0 select-text">
          <span className="absolute top-0 left-1/2 inline-flex -translate-x-1/2 items-baseline whitespace-nowrap transform-gpu">
            <span className="inline-block select-text">{displayText || "\u00A0"}</span>
            {showCursor && !prefersReducedMotion ? (
              <span
                className="caret-realistic absolute left-full ml-px leading-none pointer-events-none select-none"
                aria-hidden="true"
              >
                |
              </span>
            ) : null}
          </span>
        </span>
      </span>

      {/* Inline keyframes for cursor blink animation */}
      <style jsx>{`
        .caret-realistic {
          animation: caret-blink 1.25s ease-in-out infinite;
          will-change: opacity;
          transform: translateZ(0);
        }

        @keyframes caret-blink {
          0% {
            opacity: 1;
          }
          55% {
            opacity: 1;
          }
          70% {
            opacity: 0;
          }
          80% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .caret-realistic {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
