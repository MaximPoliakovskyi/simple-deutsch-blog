"use client";

import * as React from "react";
import CategoryPills from "@/features/categories/CategoryPills";
import type { PostCardPost } from "@/features/posts/PostCard";
import PostCard from "@/features/posts/PostCard";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/locale";
import TypewriterWords from "@/shared/ui/TypewriterWords";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: PostCardPost[];
  locale?: Locale;
  pageSize?: number;
};

export default function HeroWithFilters({ categories, initialPosts, pageSize = 6, locale }: Props) {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [allPosts, setAllPosts] = React.useState<PostCardPost[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);
  const cacheRef = React.useRef<Map<string, PostCardPost[]>>(new Map([["all", initialPosts]]));
  const requestIdRef = React.useRef(0);

  const animatedWords = [
    t("hero.words.work"),
    t("hero.words.travel"),
    t("hero.words.life"),
    t("hero.words.business"),
  ];
  const longestAnimatedWordLength = Math.max(...animatedWords.map((word) => word.length));
  const stableWidthCh = longestAnimatedWordLength + 0.3;

  React.useEffect(() => {
    cacheRef.current = new Map([["all", initialPosts]]);
    requestIdRef.current += 1;
    setAllPosts(initialPosts);
    setDisplayedCount(pageSize);
    setIsLoading(false);
    setSelectedCategory(null);
  }, [initialPosts, pageSize]);

  const handleCategorySelect = React.useCallback(
    async (slug: string | null) => {
      setSelectedCategory(slug);
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

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as { posts?: PostCardPost[] };
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

  const loadMore = React.useCallback(() => {
    setDisplayedCount((count) => count + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-0 pt-12 text-center sm:pt-14 md:pt-16">
        <h1 className="m-0 text-center text-[46px] font-extrabold leading-[50px] tracking-[-1.38px] text-[var(--sd-text)] sm:text-[56px] sm:leading-[60px] sm:tracking-[-1.68px] xl:text-[72px] xl:leading-[77.76px] xl:tracking-[-2.16px]">
          {t("hero.line1")}
          <br />
          {t("hero.line2")}
          <br />
          <span className="inline-block whitespace-nowrap align-baseline">
            <TypewriterWords
              className="text-[#155dfc]"
              containerClassName="text-[46px] font-extrabold leading-[50px] tracking-[-1.38px] sm:text-[56px] sm:leading-[60px] sm:tracking-[-1.68px] xl:text-[72px] xl:leading-[77.76px] xl:tracking-[-2.16px]"
              deleteMsPerChar={60}
              fallbackWidthCh={stableWidthCh}
              pauseAfterDeleteMs={600}
              pauseAfterTypeMs={2200}
              showCursor={true}
              typeMsPerChar={100}
              words={animatedWords}
            />
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-[576px] text-center text-[16px] leading-[26px] text-[#737373]">
          {t("hero.description")}{" "}
          <a className="inline font-normal text-[#155dfc] underline underline-offset-2" href="#top">
            {t("promo.cta")}
          </a>
        </p>

        <CategoryPills
          categories={categories}
          className="mt-8 justify-center"
          initialSelected={null}
          onSelect={handleCategorySelect}
          selected={selectedCategory}
        />
      </section>

      <div className="flex flex-col gap-8">
        {displayedPosts.length === 0 && !isLoading && (
          <div className="text-center text-[var(--sd-text-muted)]">{t("posts.empty")}</div>
        )}

        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
            {displayedPosts.map((post, index) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} priority={index < 3} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoading}
              className="sd-pill mx-auto cursor-pointer rounded-full px-5 py-2 text-sm font-medium shadow-md transition duration-200 ease-out hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              style={{ outlineColor: "oklch(0.371 0 0)" }}
            >
              {isLoading ? t("common.loading") : t("common.loadMore")}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
