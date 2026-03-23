"use client";

import * as React from "react";
import CategoryPills from "@/features/categories/CategoryPills";
import PostCard from "@/features/posts/PostCard";
import type { WPPostCard } from "@/server/wp/types";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import type { Locale } from "@/shared/i18n/locale";
import Button from "@/shared/ui/Button";

type Category = {
  canonicalTagDatabaseId: number;
  id: string;
  name: string;
  slug: string;
  tagDatabaseId: number;
};

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  initialSelectedCategory?: string | null;
  locale?: Locale;
  pageSize?: number;
};

export default function CategoriesBlockClient({
  categories,
  initialSelectedCategory,
  initialPosts,
  pageSize = 3,
  locale,
}: Props) {
  const { t } = useI18n();

  const preferredInitial = React.useMemo(() => {
    const a1 = categories.find((category) => (category.slug ?? "").toLowerCase() === "a1");
    return a1 ? a1.slug : categories.length > 0 ? categories[0].slug : null;
  }, [categories]);

  const selectedOnMount = initialSelectedCategory ?? preferredInitial;
  const cacheRef = React.useRef<Map<string, WPPostCard[]>>(
    selectedOnMount ? new Map([[selectedOnMount, initialPosts]]) : new Map(),
  );
  const requestIdRef = React.useRef(0);
  const [allPosts, setAllPosts] = React.useState<WPPostCard[]>(initialPosts);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(selectedOnMount);

  React.useEffect(() => {
    cacheRef.current = selectedOnMount ? new Map([[selectedOnMount, initialPosts]]) : new Map();
    requestIdRef.current += 1;
    setAllPosts(initialPosts);
    setDisplayedCount(pageSize);
    setIsLoading(false);
    setIsFetching(false);
    setSelectedCategory(selectedOnMount);
  }, [initialPosts, pageSize, selectedOnMount]);

  const handleCategorySelect = React.useCallback(
    async (slug: string | null) => {
      if (!slug) return;
      setSelectedCategory(slug);

      const selectedTag = categories.find((category) => category.slug === slug);
      if (!selectedTag) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`[levels] Unknown selected level "${slug}".`);
        }
        setAllPosts([]);
        return;
      }

      const cached = cacheRef.current.get(slug);
      if (cached) {
        setAllPosts(cached);
        setDisplayedCount(pageSize);
        setIsFetching(false);
        setIsLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setIsFetching(true);
      setIsLoading(true);

      try {
        const url = new URL("/api/posts", window.location.origin);
        url.searchParams.set("first", "100");
        url.searchParams.set("tagId", String(selectedTag.tagDatabaseId));
        url.searchParams.set("canonicalTagId", String(selectedTag.canonicalTagDatabaseId));
        if (locale) url.searchParams.set("lang", locale);

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = (await response.json()) as { posts?: unknown };
        const posts: WPPostCard[] = Array.isArray(data.posts) ? (data.posts as WPPostCard[]) : [];

        if (requestIdRef.current !== requestId) return;

        cacheRef.current.set(slug, posts);
        setAllPosts(posts);
        setDisplayedCount(pageSize);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        if (requestIdRef.current === requestId) {
          setAllPosts([]);
        }
      } finally {
        if (requestIdRef.current === requestId) {
          setIsFetching(false);
          setIsLoading(false);
        }
      }
    },
    [categories, locale, pageSize],
  );

  const loadMore = React.useCallback(() => {
    setDisplayedCount((count) => count + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <div className="flex flex-col gap-[var(--space-8)]">
      <CategoryPills
        alignment="left"
        categories={categories}
        className="items-center"
        initialSelected={selectedOnMount}
        onSelect={handleCategorySelect}
        required={true}
        selected={selectedCategory}
        variant="level"
      />

      {displayedPosts.length === 0 && !isFetching && <div>{t("posts.empty")}</div>}

      {displayedPosts.length > 0 && (
        <div className="sd-post-grid sd-post-grid--compact">
          {displayedPosts.map((post) => (
            <div key={post.id ?? post.slug}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button className="min-w-[108px]" disabled={isLoading} onClick={loadMore}>
            {isLoading ? t("common.loading") : t("common.loadMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
