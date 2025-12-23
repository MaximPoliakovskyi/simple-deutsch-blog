"use client";

import * as React from "react";
import CategoryPills from "@/components/features/categories/CategoryPills";
import PostCard from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { WPPostCard } from "@/server/wp/api";

type Locale = "en" | "ru" | "ua";
type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: Locale;
};

export default function CategoriesBlockClient({
  categories,
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
  pageSize = 3,
  locale,
}: Props) {
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(
    categories.length > 0 ? categories[0].slug : null
  );
  const [allPosts, setAllPosts] = React.useState<WPPostCard[]>([]);
  const [displayedCount, setDisplayedCount] = React.useState(pageSize);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);

  // Fetch all posts for the selected tag
  React.useEffect(() => {
    let cancelled = false;

    async function fetchAllPosts() {
      if (!selectedCategory) return;
      
      setIsFetching(true);
      setIsLoading(true);
      try {
        const url = new URL("/api/posts", window.location.origin);
        // Fetch a large batch to get all available posts for this tag
        url.searchParams.set("first", "100");
        url.searchParams.set("tag", selectedCategory);
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
        if (!cancelled) {
          setIsFetching(false);
          setIsLoading(false);
        }
      }
    }

    fetchAllPosts();
    return () => { cancelled = true; };
  }, [selectedCategory, locale, pageSize]);

  const loadMore = React.useCallback(() => {
    setDisplayedCount((prev) => prev + pageSize);
  }, [pageSize]);

  const displayedPosts = allPosts.slice(0, displayedCount);
  const hasMore = displayedCount < allPosts.length;

  return (
    <div>
      <div className="mb-4">
        <CategoryPills
          categories={categories}
          initialSelected={categories.length > 0 ? categories[0].slug : null}
          onSelect={(slug) => setSelectedCategory(slug)}
          alignment="left"
          required={true}
        />
      </div>

      <div className="flex flex-col gap-8">
        {displayedPosts.length === 0 && !isFetching && (
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
    </div>
  );
}
