"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/providers";
import type { Locale } from "@/lib/i18n";
import type { WPPostCard } from "@/lib/posts";
import PostCard, { CategoryPills } from "./cards";
import type { TypewriterWordsProps } from "./typewriter-words";

// ---------------------------------------------------------------------------
// TypewriterWords — loaded in a separate chunk via dynamic import so that its
// animation hooks (setTimeout chains, requestAnimationFrame, resize/font
// listeners) do NOT execute during the initial hydration pass.  The SSR path
// still renders a stable-width placeholder via `fallbackWidthCh`.
// ---------------------------------------------------------------------------
const TypewriterWords = dynamic<TypewriterWordsProps>(
  () => import("./typewriter-words"),
);

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
