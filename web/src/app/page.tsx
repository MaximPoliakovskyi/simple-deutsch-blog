import { headers } from "next/headers";
import { Suspense } from "react";
import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import HeroWithFilters from "@/components/features/search/HeroWithFilters";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { deduplicateCategories, filterOutCEFRLevels } from "@/core/content/categoryUtils";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllCategories } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import type { WPPostCard } from "@/server/wp/api";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type PostsResponse = { posts: WPPostCard[]; pageInfo: PageInfo };
type CategoryNode = { id: string; name: string; slug: string };

async function getBaseUrl() {
  const h = await headers();
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "");
  const proto = h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  if (!host) throw new Error("Cannot determine host");
  return `${proto}://${host}`;
}

async function getPosts(first: number, locale?: string): Promise<PostsResponse> {
  const base = await getBaseUrl();
  const url = new URL("/api/posts", base);
  url.searchParams.set("first", String(first));
  if (locale) url.searchParams.set("lang", locale);

  const res = await fetch(url, { next: { revalidate: 60 } } as RequestInit & {
    next?: { revalidate?: number; tags?: string[] };
  });
  if (!res.ok) return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };

  const json = await res.json();
  return {
    posts: (json.posts ?? json ?? []) as WPPostCard[],
    pageInfo: (json.pageInfo ?? { endCursor: null, hasNextPage: false }) as PageInfo,
  };
}

export const revalidate = 300;

export default async function HomePage({ locale }: { locale?: "en" | "ru" | "uk" } = {}) {
  // Use provided locale or default to English
  const effectiveLocale = locale ?? "en";
  const PAGE_SIZE = 6;

  // Fetch more posts initially for client-side pagination
  const { posts, pageInfo } = await getPosts(100, effectiveLocale);

  const t = TRANSLATIONS[effectiveLocale ?? DEFAULT_LOCALE];

  function estimateReadingMinutesFromContent(post: any): number | null {
    if (post.readingMinutes != null) return Math.max(1, Math.ceil(post.readingMinutes));
    const html = post.content ?? post.excerpt ?? "";
    if (!html) return null;
    const text = String(html).replace(/<[^>]+>/g, " ");
    const words = (text.trim().match(/\S+/g) ?? []).length;
    const MIN_WORDS_FOR_ESTIMATE = 40;
    if (words < MIN_WORDS_FOR_ESTIMATE) return null;
    return Math.max(1, Math.ceil(words / 200));
  }

  const mappedPosts = posts.map((p) => {
    try {
      const minutes = estimateReadingMinutesFromContent(p as any);
      const dateText = p.date
        ? new Intl.DateTimeFormat(effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: minutes ? `${minutes} ${t.minRead}` : null, dateText, href };
    } catch (e) {
      const dateText = p.date
        ? new Intl.DateTimeFormat(effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          }).format(new Date(p.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: null, dateText, href };
    }
  });

  const catsResp = await getAllCategories({ first: 50 });
  const allCategories = extractConnectionNodes<CategoryNode>(catsResp?.categories);
  
  // Filter categories: remove duplicates (multilingual), hide hidden ones, and exclude CEFR levels
  const categoryNodes = filterOutCEFRLevels(
    deduplicateCategories(
      filterHiddenCategories(allCategories)
    )
  ).slice(0, 7);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <HeroWithFilters
          categories={categoryNodes}
          initialPosts={mappedPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </main>

      <Suspense fallback={<div className="h-96" />}>
        <SuccessStoriesSliderServer locale={effectiveLocale} />
      </Suspense>
      <Suspense fallback={<div className="h-96" />}>
        <LatestPostsSliderServer locale={effectiveLocale} />
      </Suspense>
      <Suspense fallback={<div className="h-64" />}>
        <CategoriesBlock locale={effectiveLocale} />
      </Suspense>
    </>
  );
}
