"use client";

import * as React from "react";
import CategoryPills from "@/components/features/categories/CategoryPills";
import PostCard from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";

type Category = {
  id: string;
  name: string;
  slug: string;
  tagDatabaseId: number;
  canonicalTagDatabaseId: number;
};

type Props = {
  categories: Category[];
  initialSelectedCategory?: string | null;
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: Locale;
};

export default function CategoriesBlockClient({
  categories,
  initialSelectedCategory,
  initialPosts,
  initialEndCursor: _initialEndCursor,
  initialHasNextPage: _initialHasNextPage,
  pageSize = 3,
  locale,
}: Props) {
  const { t } = useI18n();
  // Prefer A1 level when available to ensure A1 is selected initially
  const preferredInitial = React.useMemo(() => {
    const a1 = categories.find((c) => (c.slug ?? "").toLowerCase() === "a1");
    return a1 ? a1.slug : categories.length > 0 ? categories[0].slug : null;
  }, [categories]);
  const selectedOnMount = initialSelectedCategory ?? preferredInitial;

  const cacheRef = React.useRef<Map<string, WPPostCard[]>>(new Map());
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(selectedOnMount);
  const [allPosts, setAllPosts] = React.useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    if (!selectedOnMount) return;
    cacheRef.current.set(selectedOnMount, initialPosts);
    setAllPosts(initialPosts);
    setDisplayedCount(pageSize);
  }, [initialPosts, pageSize, selectedOnMount]);

  // Fetch all posts for the selected tag
  React.useEffect(() => {
    let cancelled = false;

    async function fetchAllPosts() {
      if (!selectedCategory) return;
      const selectedTag = categories.find((category) => category.slug === selectedCategory);
      if (!selectedTag) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[levels] Unknown selected level "${selectedCategory}".`);
        }
        setAllPosts([]);
        return;
      }

      const cached = cacheRef.current.get(selectedCategory);
      if (cached) {
        setAllPosts(cached);
        setDisplayedCount(pageSize);
        setIsFetching(false);
        setIsLoading(false);
        return;
      }

      setIsFetching(true);
      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", "100");
        url.searchParams.set("tagId", String(selectedTag.tagDatabaseId));
        url.searchParams.set("canonicalTagId", String(selectedTag.canonicalTagDatabaseId));
        if (locale) url.searchParams.set("lang", locale);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { posts?: unknown };
        const posts: WPPostCard[] = Array.isArray(data.posts) ? (data.posts as WPPostCard[]) : [];

        if (cancelled) return;

        cacheRef.current.set(selectedCategory, posts);
        setAllPosts(posts);
        setDisplayedCount(pageSize);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (!cancelled) {
          setAllPosts([]);
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
          setIsLoading(false);
        }
      }
    }

    fetchAllPosts();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, categories, locale, pageSize]);

  const loadMore = React.useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <div>
      <div className="mb-1">
        <CategoryPills
          categories={categories}
          initialSelected={selectedOnMount}
          onSelect={(slug) => setSelectedCategory(slug)}
          alignment="left"
          required={true}
        />
      </div>

      <div className="flex flex-col gap-8">
        {displayedPosts.length === 0 && !isFetching && <div>{t("noPosts")}</div>}

        {displayedPosts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
            {displayedPosts.map((post) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} />
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
    </div>
  );
}
