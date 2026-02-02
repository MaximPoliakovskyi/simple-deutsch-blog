"use client";

import * as React from "react";

interface TypewriterWordsProps {
  words: string[];
  className?: string;
  containerClassName?: string; // Classes for the outer container (e.g., font and size)
  typeMsPerChar?: number;
  deleteMsPerChar?: number;
  pauseAfterTypeMs?: number;
  pauseAfterDeleteMs?: number;
  showCursor?: boolean;
  onMaxWidthChange?: (maxWidthPx: number) => void; // Callback to notify parent of measured width
}

/**
 * Custom hook to measure the pixel width of words using a hidden measurement span.
 * Handles responsive font size changes via resize events.
 * Returns the maximum width in pixels and provides a ref for the measurement element.
 */
function useMeasureWordWidths(
  words: string[],
  containerClassName: string,
  onMaxWidthChange?: (maxWidthPx: number) => void,
) {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [maxWidthPx, setMaxWidthPx] = React.useState(0);

  const measureWidths = React.useCallback(() => {
    if (!measureRef.current) return;

    let maxWidth = 0;

    // Measure each word
    words.forEach((word) => {
      measureRef.current!.textContent = word;
      const width = measureRef.current!.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
    });

    // Add small padding for cursor space
    const finalWidth = maxWidth + 8;
    setMaxWidthPx(finalWidth);
    onMaxWidthChange?.(finalWidth);
  }, [words, onMaxWidthChange]);

  React.useEffect(() => {
    measureWidths();

    // Re-measure on window resize (for responsive font size changes)
    const resizeHandler = () => {
      measureWidths();
    };

    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
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
 *   onMaxWidthChange={(w) => setStageWidth(w)}
 * />
 */
export default function TypewriterWords({
  words,
  className = "",
  containerClassName = "",
  typeMsPerChar = 100,
  deleteMsPerChar = 60,
  pauseAfterTypeMs = 2200,
  pauseAfterDeleteMs = 600,
  showCursor = true,
  onMaxWidthChange,
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
  const displayText = prefersReducedMotion ? words[0] : currentText;

  // Measure pixel widths of all words
  const { measureRef, maxWidthPx } = useMeasureWordWidths(
    words,
    containerClassName,
    onMaxWidthChange,
  );

  // Track the rendered width of the currently typed text for cursor positioning
  const typedTextRef = React.useRef<HTMLSpanElement>(null);
  const [typedWidthPx, setTypedWidthPx] = React.useState(0);

  const measureTypedWidth = React.useCallback(() => {
    if (!typedTextRef.current) return;
    const width = typedTextRef.current.getBoundingClientRect().width;
    setTypedWidthPx(width);
  }, []);

  React.useLayoutEffect(() => {
    void displayText;
    measureTypedWidth();
  }, [displayText, measureTypedWidth]);

  React.useEffect(() => {
    const resizeHandler = () => measureTypedWidth();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [measureTypedWidth]);

  const cursorLeftPx = React.useMemo(() => {
    if (!maxWidthPx) return undefined;
    if (typedWidthPx === 0) return maxWidthPx / 2; // Center when empty
    const centeredStart = maxWidthPx / 2 - typedWidthPx / 2; // left edge of centered text
    return centeredStart + typedWidthPx; // end of text
  }, [maxWidthPx, typedWidthPx]);

  // Check for prefers-reduced-motion
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

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
        className={`relative block whitespace-nowrap text-center ${containerClassName} ${className}`}
        style={{
          width: maxWidthPx ? `${maxWidthPx}px` : undefined,
          minHeight: "1em",
          margin: "0 auto",
        }}
        aria-hidden="true"
      >
        {/* Centered typed text; measured for cursor positioning */}
        <span ref={typedTextRef} className="inline-block">
          {displayText}
        </span>

        {showCursor && !prefersReducedMotion && cursorLeftPx !== undefined && (
          <span
            className="absolute caret-realistic"
            style={{
              left: `${cursorLeftPx}px`,
              top: 0,
              height: "1em",
              width: "2px",
              marginLeft: "0px",
              lineHeight: "inherit",
              pointerEvents: "none",
              transition: "left 90ms ease-out",
            }}
            aria-hidden="true"
          >
            |
          </span>
        )}
      </span>

      {/* Inline keyframes for cursor blink animation */}
      <style jsx>{`
        .caret-realistic {
          animation: caret-blink 1.25s ease-in-out infinite;
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
