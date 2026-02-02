// Archived original root page.tsx
// This file was moved out of `web/src/app/` so the App Router has no root
// route and middleware can perform a single-hop redirect from `/` to `/en`.
// DO NOT IMPORT THIS FILE.

// Original contents (kept for reference):
// export default async function Page() {
//   // Should never be reached because middleware redirects `/` to `/en`.
//   return null;
// }

export const archived = true;
/**
 * ARCHIVE: Original root page
 * DO NOT IMPORT. This file is an archived reference of the former
 * `web/src/app/page.tsx` root page. It has been moved out of `app/`
 * to ensure the Next App Router cannot render `/`.
 *
 * The original code is preserved below inside a block comment for
 * historical reference. Keep this file unimported to avoid bundling.
 */

/*
import { headers } from "next/headers";
import { Suspense } from "react";
import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import HeroWithFilters from "@/components/features/search/HeroWithFilters";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import DeferredHeroFilters from "@/components/layout/DeferredHeroFilters";
import { deduplicateCategories, filterOutCEFRLevels } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { WPPostCard } from "@/server/wp/api";
import { getAllCategories, getPosts as getWpPosts } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

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
  const fetchPage = async (lang?: "en" | "ru" | "uk"): Promise<PostsResponse> => {
    try {
      const res = await getWpPosts({ first, locale: lang });
      const posts = (res.posts?.nodes ?? []) as WPPostCard[];
      const pageInfo = (res.posts?.pageInfo ?? { endCursor: null, hasNextPage: false }) as PageInfo;
      return { posts, pageInfo };
    } catch (e) {
      console.error("Failed to fetch posts directly:", e);
      return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };
    }
  };

  // Try localized feed first with timeout fallback to default
  try {
    const localized = await Promise.race([
      fetchPage(locale as any),
      new Promise<PostsResponse>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)),
    ]);
    
    if (localized.posts.length > 0) {
      console.log(`[home] fetched ${localized.posts.length} posts for locale="${locale ?? "default"}"`);
      return localized;
    }
  } catch (e) {
    // Timeout or error, continue to fallback
  }

  // Fallback to default locale
  if (locale) {
    const fallback = await fetchPage();
    console.log(`[home] fallback fetched ${fallback.posts.length} posts (default locale)`);
    return fallback;
  }

  // Default locale fetch
  const defaultFetch = await fetchPage();
  return defaultFetch;
}

export const revalidate = 60; // Revalidate every 60s for fresh content on homepage

export default async function HomePage({ locale }: { locale?: "en" | "ru" | "uk" } = {}) {
  // Use provided locale or default to English
  const effectiveLocale = locale ?? "en";
  const PAGE_SIZE = 6;

  // Fetch only initial posts (PAGE_SIZE) for faster FCP instead of 100
  // Additional posts loaded client-side or on-demand
  const { posts, pageInfo } = await getPosts(PAGE_SIZE * 2, effectiveLocale);

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
        ? new Intl.DateTimeFormat(
            effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US",
            {
              dateStyle: "long",
              timeZone: "UTC",
            },
          ).format(new Date(p.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: minutes ? `${minutes} ${t.minRead}` : null, dateText, href };
    } catch (e) {
      const dateText = p.date
        ? new Intl.DateTimeFormat(
            effectiveLocale === "uk" ? "uk-UA" : effectiveLocale === "ru" ? "ru-RU" : "en-US",
            {
              dateStyle: "long",
              timeZone: "UTC",
            },
          ).format(new Date(p.date))
        : null;
      const prefix = effectiveLocale === "en" ? "" : `/${effectiveLocale}`;
      const href = `${prefix}/posts/${p.slug}`;
      return { ...p, readingText: null, dateText, href };
    }
  });

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <DeferredHeroFilters
            initialPosts={mappedPosts}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
            pageSize={PAGE_SIZE}
            locale={effectiveLocale}
          />
        </Suspense>
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
*/

// End of archived file. Do not import this file; it exists only for reference.
