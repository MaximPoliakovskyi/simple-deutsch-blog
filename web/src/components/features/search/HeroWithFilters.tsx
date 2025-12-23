"use client";

import * as React from "react";
import CategoryPills from "@/components/features/categories/CategoryPills";
import PostCard from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { WPPostCard } from "@/server/wp/api";

type Cat = { id: string; name: string; slug: string };

export default function HeroWithFilters({
  categories,
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 6,
  locale,
}: {
  categories: Cat[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: "en" | "ru" | "ua";
}) {
  const { t, locale: uiLocale } = useI18n();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [allPosts, setAllPosts] = React.useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);

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
    return () => { cancelled = true; };
  }, [selectedCategory, locale, pageSize, initialPosts]);

  const loadMore = React.useCallback(() => {
    setDisplayedCount(prev => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <>
      <section className="text-center max-w-4xl mx-auto py-12">
        <h1 className="font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))]">
          {(() => {
            const raw = t("heroTitle");
            // Words to highlight per locale
            const highlightMap: Record<"en" | "ua" | "ru", string> = {
              en: "practical",
              ua: "практичні",
              ru: "практичные",
            };
            const highlight = highlightMap[uiLocale] ?? "practical";
            const idx = raw.indexOf(highlight);
            if (idx === -1) return raw;
            return (
              <>
                {raw.slice(0, idx)}
                <span className="text-blue-600">{highlight}</span>
                {raw.slice(idx + highlight.length)}
              </>
            );
          })()}
        </h1>

        <p className="mt-6 text-[hsl(var(--fg-muted))] text-base sm:text-xl">
          {t("heroDescription")}{" "}
          <a className="text-blue-600 underline" href="#">
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
        {displayedPosts.length === 0 && !isLoading && (
          <div>{t("noPosts")}</div>
        )}
        
        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
            {displayedPosts.map((post) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={[
              "mx-auto rounded-full px-5 py-2 text-sm font-medium",
              "transition duration-200 ease-out",
              "transform-gpu hover:scale-[1.03] motion-reduce:transform-none",
              "shadow-md hover:shadow-lg disabled:opacity-60",
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
