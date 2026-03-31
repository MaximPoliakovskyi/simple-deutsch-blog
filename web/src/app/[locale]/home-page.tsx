import { DEFAULT_LOCALE, formatPostCardDate, type Locale } from "@/lib/i18n";
import { buildLocalePostHref, getHomePagePosts } from "@/lib/posts";
import CategoriesBlock from "./_components/categories-block";
import Hero from "./_components/hero";
import LatestPostsSliderServer from "./_components/latest-posts-slider-server";
import SuccessStoriesSliderServer from "./_components/success-stories-slider-server";

export const revalidate = 60;

export default async function HomePage({ locale }: { locale?: Locale } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const PAGE_SIZE = 6;
  const { posts, pageInfo } = await getHomePagePosts(effectiveLocale, PAGE_SIZE);

  const mappedPosts = posts.map((post) => ({
    ...post,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
    readingText: post.readingText ?? null,
  }));

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Hero
          initialPosts={mappedPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </section>

      <SuccessStoriesSliderServer locale={effectiveLocale} />
      <LatestPostsSliderServer locale={effectiveLocale} />
      <CategoriesBlock locale={effectiveLocale} />
    </>
  );
}
