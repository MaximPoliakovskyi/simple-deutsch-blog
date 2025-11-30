// src/app/posts/PostsIndex.tsx
import PostsGridWithPagination from "@/components/PostsGridWithPagination";
import React from "react";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/lib/api";
import {
  getPostsPage,
  getPostsPageByCategory,
  getPostsByTagSlug,
  getPosts,
} from "@/lib/wp/api";

// PAGE_SIZE as requested
const PAGE_SIZE = 6;

// Fetch first page (server-side) using existing WP helpers
async function fetchPostsFromWordPressFirstPage(params: {
  first: number;
  lang?: string;
  categorySlug?: string | null;
  tagSlug?: string | null;
  level?: string | null;
}): Promise<{ posts: any[]; pageInfo: { hasNextPage: boolean; endCursor: string | null } }> {
  const { first, lang, categorySlug, tagSlug } = params;

  // Prefer tag filtering when tagSlug is provided
  if (tagSlug) {
    const res = await getPostsByTagSlug(tagSlug, first);
    const posts = (res.posts?.nodes ?? []) as any[];
    const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    return { posts, pageInfo };
  }

  // If a specific category slug is provided, use the category-based paged query
  if (categorySlug) {
    const { posts, pageInfo } = await getPostsPageByCategory({ first, after: undefined, categorySlug });
    return { posts, pageInfo };
  }

  // If a language is provided, use the locale-aware `getPosts` helper
  if (lang) {
    const res = await getPosts({ first, locale: lang });
    const posts = (res.posts?.nodes ?? []) as any[];
    const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    return { posts, pageInfo };
  }

  // Default: use paginated posts connection
  const { posts, pageInfo } = await getPostsPage({ first, after: undefined });
  return { posts, pageInfo };
}

export default async function PostsIndex({ locale }: { locale?: Locale }) {
  const lang = locale ?? "en";
  const categorySlug = null;
  const tagSlug = null;
  const level = null;

  const { posts, pageInfo } = await fetchPostsFromWordPressFirstPage({
    first: PAGE_SIZE,
    lang,
    categorySlug,
    tagSlug,
    level,
  });

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{t.posts}</h1>
      <PostsGridWithPagination
        key={`${lang}-${level ?? "all"}-${categorySlug ?? "all"}-${tagSlug ?? "all"}`}
        initialPosts={posts}
        initialPageInfo={pageInfo}
        pageSize={PAGE_SIZE}
        query={{ lang, categorySlug, tagSlug, level }}
      />
    </div>
  );
}
