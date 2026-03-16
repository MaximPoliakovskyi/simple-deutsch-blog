import { Suspense } from "react";
import CategoryPillsSkeleton from "@/components/features/categories/CategoryPillsSkeleton";
import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import DeferredHeroFilters from "@/components/layout/DeferredHeroFilters";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getPostsLightweight as getWpPostsLightweight } from "@/server/wp/api";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type PostsResponse = { posts: WPPostCard[]; pageInfo: PageInfo };

async function fetchPosts(first: number, locale?: Locale): Promise<PostsResponse> {
  try {
    const res = await getWpPostsLightweight({ first, locale });
    const posts = (res.posts?.nodes ?? []) as WPPostCard[];
    const pageInfo = (res.posts?.pageInfo ?? { endCursor: null, hasNextPage: false }) as PageInfo;
    return { posts, pageInfo };
  } catch (e) {
    console.error("Failed to fetch posts directly:", e);
    return { posts: [], pageInfo: { endCursor: null, hasNextPage: false } };
  }
}

export const revalidate = 60;

function HeroFiltersFallback() {
  return (
    <section className="text-center max-w-7xl mx-auto px-4 pt-12 sm:pt-14 md:pt-16 pb-0">
      <div className="mx-auto mb-6 h-32 max-w-4xl rounded-[2rem] bg-neutral-950/40" aria-hidden="true" />
      <div className="mx-auto mb-8 h-6 max-w-xl rounded-full bg-neutral-950/40" aria-hidden="true" />
      <CategoryPillsSkeleton count={7} alignment="center" />
    </section>
  );
}

function CategoriesBlockFallback() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <CategoryPillsSkeleton count={6} alignment="left" />
    </section>
  );
}

export default async function HomePage({ locale }: { locale?: Locale } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const PAGE_SIZE = 6;
  const { posts, pageInfo } = await fetchPosts(PAGE_SIZE * 2, effectiveLocale);

  const mappedPosts = posts.map((p) => {
    try {
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
      return { ...p, readingText: p.readingText ?? null, dateText, href };
    } catch (_e) {
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
        <Suspense fallback={<HeroFiltersFallback />}>
          <DeferredHeroFilters
            initialPosts={mappedPosts}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
            pageSize={PAGE_SIZE}
            locale={effectiveLocale}
          />
        </Suspense>
      </main>

      <SuccessStoriesSliderServer locale={effectiveLocale} />
      <LatestPostsSliderServer locale={effectiveLocale} />
      <Suspense fallback={<CategoriesBlockFallback />}>
        <CategoriesBlock locale={effectiveLocale} />
      </Suspense>
    </>
  );
}
