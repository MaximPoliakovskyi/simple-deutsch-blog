"use client";

import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import type { Locale } from "@/lib/i18n";
import type { WPPostCard } from "@/lib/posts";
import PostCard, { CategoryPills } from "./cards";

// ---------------------------------------------------------------------------
// TypewriterWords — inlined from typewriter-words.tsx
// ---------------------------------------------------------------------------

interface TypewriterWordsProps {
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
});

TypewriterWords.displayName = "TypewriterWords";

// ---------------------------------------------------------------------------
// HeroWithFilters — default export (formerly hero-client.tsx)
// ---------------------------------------------------------------------------

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: Locale;
};

const HERO_KEYWORDS: Record<string, string[]> = {
  en: ["work", "travel", "life", "business"],
  uk: ["роботи", "подорожей", "життя", "бізнесу"],
  ru: ["работы", "путешествия", "жизни", "бизнеса"],
};

export default function HeroWithFilters({
  categories,
  initialPosts,
  initialEndCursor: _initialEndCursor,
  initialHasNextPage: _initialHasNextPage,
  pageSize = 6,
  locale,
}: Props) {
  const { t, locale: uiLocale } = useI18n();
  const heroHeadingId = useId();
  const featuredPostsHeadingId = useId();
  const [allPosts, setAllPosts] = useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = useState(pageSize);
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Map<string, WPPostCard[]>>(new Map([["all", initialPosts]]));
  const requestIdRef = useRef(0);
  const animatedWords = useMemo(
    () => HERO_KEYWORDS[uiLocale as string] || HERO_KEYWORDS.en,
    [uiLocale],
  );
  const stableWidthCh = useMemo(
    () => Math.max(...animatedWords.map((word) => word.length)) + 0.3,
    [animatedWords],
  );

  useEffect(() => {
    cacheRef.current = new Map([["all", initialPosts]]);
    requestIdRef.current += 1;
    setAllPosts(initialPosts);
    setDisplayedCount(pageSize);
    setIsLoading(false);
  }, [initialPosts, pageSize]);

  const handleCategorySelect = useCallback(
    async (slug: string | null) => {
      const key = slug ?? "all";
      const cached = cacheRef.current.get(key);
      if (cached) {
        setAllPosts(cached);
        setDisplayedCount(pageSize);
        setIsLoading(false);
        return;
      }

      if (!slug) {
        setAllPosts(initialPosts);
        setDisplayedCount(pageSize);
        setIsLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsLoading(true);

      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", "100");
        url.searchParams.set("category", slug);
        url.searchParams.set("lang", locale ?? "en");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { posts?: WPPostCard[] };
        if (requestIdRef.current !== requestId) return;

        const posts = data.posts ?? [];
        cacheRef.current.set(key, posts);
        setAllPosts(posts);
        setDisplayedCount(pageSize);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (requestIdRef.current === requestId) {
          setAllPosts([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    },
    [initialPosts, locale, pageSize],
  );

  const loadMore = useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = useMemo(
    () => allPosts.slice(0, displayedCount),
    [allPosts, displayedCount],
  );
  const hasMore = displayedCount < allPosts.length;

  return (
    <>
      <section className="sd-fade-in-slow text-center max-w-7xl mx-auto px-4 pt-12 sm:pt-14 md:pt-16 pb-0">
        <h1
          id={heroHeadingId}
          className="m-0 p-0 text-center font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1] tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))] select-text"
        >
          {t("heroLine1")}
          <br />
          {t("heroLine2")}
          <br />
          <span className="inline-block whitespace-nowrap align-baseline select-text">
            <TypewriterWords
              words={animatedWords}
              className="text-blue-600"
              containerClassName="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1]"
              fallbackWidthCh={stableWidthCh}
              typeMsPerChar={100}
              deleteMsPerChar={60}
              pauseAfterTypeMs={2200}
              pauseAfterDeleteMs={600}
              showCursor
            />
          </span>
        </h1>

        <p className="mt-6 sm:mt-8 mx-auto max-w-xl text-center text-[hsl(var(--fg-muted))] text-base sm:text-lg leading-relaxed">
          {t("heroDescription")}{" "}
          <a className="inline text-blue-600 underline" href="#top">
            {t("promoCta")}
          </a>
        </p>

        <CategoryPills
          categories={categories}
          initialSelected={null}
          onSelect={handleCategorySelect}
        />
      </section>

      <section aria-labelledby={featuredPostsHeadingId} className="flex flex-col gap-8">
        <h2 id={featuredPostsHeadingId} className="sr-only">
          {t("latestPosts") || "Latest posts"}
        </h2>

        {displayedPosts.length === 0 && !isLoading && <div>{t("noPosts")}</div>}

        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 py-2">
            {displayedPosts.map((post, idx) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} priority={idx < 3} index={idx} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className={[
              "mx-auto rounded-full px-5 py-2 text-sm font-medium",
              "transition duration-200 ease-out",
              "transform-gpu hover:scale-[1.03] motion-reduce:transform-none",
              "shadow-md hover:shadow-lg disabled:opacity-60",
              "cursor-pointer disabled:cursor-not-allowed",
              "sd-pill",
              "focus-visible:outline-2 focus-visible:outline-offset-2",
            ].join(" ")}
            style={{ outlineColor: "oklch(0.371 0 0)", borderColor: "transparent" }}
          >
            {isLoading ? t("loading") || "Loading..." : t("loadMore") || "Load more"}
          </button>
        )}
      </section>
    </>
  );
}
