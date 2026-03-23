import CategoriesBlock from "@/components/features/categories/CategoriesBlock";
import LatestPostsSliderServer from "@/components/features/posts/LatestPosts/LatestPostsSliderServer";
import SuccessStoriesSliderServer from "@/components/features/stories/SuccessStories/SuccessStoriesSliderServer";
import DeferredHeroFilters from "@/components/layout/DeferredHeroFilters";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getPosts as getWpPosts } from "@/server/wp/api";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type PostsResponse = { posts: WPPostCard[]; pageInfo: PageInfo };

async function fetchPosts(first: number, locale?: Locale): Promise<PostsResponse> {
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
        <DeferredHeroFilters
          initialPosts={mappedPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </main>

      <SuccessStoriesSliderServer locale={effectiveLocale} />
      <LatestPostsSliderServer locale={effectiveLocale} />
      <CategoriesBlock locale={effectiveLocale} />
    </>
  );
}
