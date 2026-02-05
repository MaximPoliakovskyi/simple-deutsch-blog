"use client";

import dynamic from "next/dynamic";
import * as React from "react";
import CategoryPills from "@/components/features/categories/CategoryPills";
import PostCard from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { WPPostCard } from "@/server/wp/api";

// Defer TypewriterWords loading to not block initial paint
const TypewriterWords = dynamic(() => import("@/components/ui/TypewriterWords"), {
  ssr: false,
  loading: () => <span className="text-blue-600">work</span>,
});

import type { Locale } from "@/i18n/locale";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: Locale;
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
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [allPosts, setAllPosts] = React.useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);
  const [measuredWidthPx, setMeasuredWidthPx] = React.useState<number | null>(null);

  // Locale-aware animated words for hero headline (line 3)
  // Each locale provides its own word list
  const HERO_ANIMATED_WORDS: Record<string, string[]> = {
    en: ["work", "travel", "life", "business"],
    uk: ["роботи", "подорожей", "життя", "бізнесу"],
    ru: ["работы", "путешествия", "жизни", "бизнеса"],
  };

  const animatedWords = HERO_ANIMATED_WORDS[uiLocale as string] || HERO_ANIMATED_WORDS.en;

  // Calculate the longest animated word length for stable width (prevents horizontal drift)
  // Each ch unit ≈ one character width; add ~0.2 for cursor space
  const longestAnimatedWordLength = Math.max(...animatedWords.map((w) => w.length));
  const stableWidthCh = longestAnimatedWordLength + 0.3; // +0.3ch for cursor space

  // Fetch posts when category filter changes
  React.useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      if (!selectedCategory) {
        setAllPosts(initialPosts);
        setDisplayedCount(pageSize);
        return;
      }

      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", "100");
        url.searchParams.set("category", selectedCategory);
        url.searchParams.set("lang", locale ?? "en");

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (cancelled) return;

        setAllPosts(data.posts ?? []);
        setDisplayedCount(pageSize);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (!cancelled) {
          setAllPosts([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, locale, pageSize, initialPosts]);

  const loadMore = React.useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <>
      <section className="text-center max-w-7xl mx-auto px-4 pt-12 sm:pt-14 md:pt-16 pb-0">
        {/* Hero heading: single h1 with manual line breaks and minimal line height */}
        <h1 className="m-0 p-0 text-center font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1] tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))]">
          {t("heroLine1")}
          <br />
          {t("heroLine2")}
          <br />
          <span
            className="inline-block"
            style={{
              width: measuredWidthPx ? `${measuredWidthPx}px` : `${stableWidthCh}ch`,
            }}
          >
            <TypewriterWords
              words={animatedWords}
              className="text-blue-600"
              containerClassName="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1]"
              typeMsPerChar={100}
              deleteMsPerChar={60}
              pauseAfterTypeMs={2200}
              pauseAfterDeleteMs={600}
              showCursor={true}
              onMaxWidthChange={setMeasuredWidthPx}
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
          onSelect={(slug) => setSelectedCategory(slug)}
        />
      </section>

      <div className="flex flex-col gap-8">
        {displayedPosts.length === 0 && !isLoading && <div>{t("noPosts")}</div>}

        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            {displayedPosts.map((post, idx) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} priority={idx < 3} />
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
            {isLoading ? t("loading") || "Loading…" : t("loadMore") || "Load more"}
          </button>
        )}
      </div>
    </>
  );
}
