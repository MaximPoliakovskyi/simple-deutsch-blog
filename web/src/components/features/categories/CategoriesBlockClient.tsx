"use client";

import * as React from "react";
import CategoryPills from "@/components/features/categories/CategoryPills";
import PostCard from "@/components/features/posts/PostCard";
import { useI18n } from "@/core/i18n/LocaleProvider";
import type { Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";

type Category = { id: string; name: string; slug: string };

type Props = {
  categories: Category[];
  initialPosts: WPPostCard[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
  pageSize?: number;
  locale?: Locale;
};

type TranslationLike = {
  slug?: string | null;
  language?: { code?: string | null } | null;
};

type PostWithTranslations = WPPostCard & {
  translations?: TranslationLike[] | null;
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
  // Prefer A1 level when available to ensure A1 is selected initially
  const preferredInitial = React.useMemo(() => {
    const a1 = categories.find((c) => (c.slug ?? "").toLowerCase() === "a1");
    return a1 ? a1.slug : categories.length > 0 ? categories[0].slug : null;
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(preferredInitial);
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
        // For Ukrainian and Russian locales, fetch English posts first (then translate)
        const shouldFetchEnglish = locale === "uk" || locale === "ru";
        const fetchLang = shouldFetchEnglish ? undefined : locale;

        const url = new URL("/api/posts", window.location.origin);
        // Fetch a large batch to get all available posts for this tag
        url.searchParams.set("first", "100");
        url.searchParams.set("tag", selectedCategory);
        if (fetchLang) {
          url.searchParams.set("lang", fetchLang);
        }

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { posts?: unknown };
        let posts: PostWithTranslations[] = Array.isArray(data.posts)
          ? (data.posts as PostWithTranslations[])
          : [];

        if (cancelled) return;

        // If Ukrainian or Russian locale, fetch translated versions of posts
        if (shouldFetchEnglish && posts.length > 0) {
          const translatedPosts: PostWithTranslations[] = [];
          const targetLangCode = locale === "uk" ? "UK" : locale === "ru" ? "RU" : null;

          if (targetLangCode) {
            for (const post of posts) {
              const translation = post.translations?.find(
                (t) => t?.language?.code === targetLangCode,
              );

              if (translation?.slug) {
                try {
                  // Fetch translated version
                  const translatedUrl = new URL("/api/posts", window.location.origin);
                  translatedUrl.searchParams.set("slug", translation.slug);
                  const translatedRes = await fetch(translatedUrl.toString());

                  if (translatedRes.ok) {
                    const translatedData = (await translatedRes.json()) as { posts?: unknown };
                    const translatedPost =
                      Array.isArray(translatedData.posts) && translatedData.posts.length > 0
                        ? (translatedData.posts[0] as PostWithTranslations)
                        : null;
                    if (translatedPost) {
                      translatedPosts.push(translatedPost);
                    }
                  }
                } catch (err) {
                  console.error(`Failed to fetch ${locale} post ${translation.slug}:`, err);
                }
              }
            }

            posts = translatedPosts;
          }
        }

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
  }, [selectedCategory, locale, pageSize]);

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
          initialSelected={preferredInitial}
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
