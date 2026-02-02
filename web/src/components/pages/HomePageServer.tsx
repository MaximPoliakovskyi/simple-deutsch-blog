import { Suspense } from "react";
import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import DeferredHeroFilters from "@/components/layout/DeferredHeroFilters";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { WPPostCard } from "@/server/wp/api";
import { getPosts as getWpPosts } from "@/server/wp/api";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type PostsResponse = { posts: WPPostCard[]; pageInfo: PageInfo };

async function fetchPosts(first: number, locale?: "en" | "ru" | "uk"): Promise<PostsResponse> {
  try {
    const res = await getWpPosts({ first, locale });
    const posts = (res.posts?.nodes ?? []) as WPPostCard[];
    const pageInfo = (res.posts?.pageInfo ?? { endCursor: null, hasNextPage: false }) as PageInfo;
    return { posts, pageInfo };
  } catch (e) {
    console.error("Failed to fetch posts directly:", e);
    return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };
  }
}

export const revalidate = 60;

export default async function HomePage({ locale }: { locale?: "en" | "ru" | "uk" } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const PAGE_SIZE = 6;
  const { posts, pageInfo } = await fetchPosts(PAGE_SIZE * 2, effectiveLocale as any);
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
