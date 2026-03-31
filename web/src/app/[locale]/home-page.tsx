import CategoriesBlock from "@/components/categories-block";
import HeroWithFilters from "@/components/hero";
import LatestPostsSlider from "@/components/latest-posts-slider";
import SuccessStoriesSlider from "@/components/success-stories-slider";
import { DEFAULT_LOCALE, formatPostCardDate, type Locale, TRANSLATIONS } from "@/lib/i18n";
import {
  buildLocalePostHref,
  deduplicateCategories,
  extractConnectionNodes,
  filterHiddenCategories,
  filterOutCEFRLevels,
  getAllCategories,
  getHomePagePosts,
  getPosts,
  getPostsByCategory,
  type WPPostCard,
} from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage({ locale }: { locale?: Locale } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const PAGE_SIZE = 6;

  // Fetch all home-page data in parallel
  const [{ posts, pageInfo }, allCategoriesResp, latestPostsResp, successStoriesResp] =
    await Promise.all([
      getHomePagePosts(effectiveLocale, PAGE_SIZE),
      getAllCategories({ first: 50, locale: effectiveLocale }).catch(() => null),
      getPosts({ first: 8, locale: effectiveLocale }).catch(() => ({ posts: { nodes: [] } })),
      getPostsByCategory({
        first: 8,
        after: null,
        locale: effectiveLocale,
        categorySlug:
          effectiveLocale === "uk"
            ? "success-stories-uk"
            : effectiveLocale === "ru"
              ? "success-stories-ru"
              : "success-stories",
      }).catch(() => ({ posts: [] })),
    ]);

  const mappedPosts = posts.map((post) => ({
    ...post,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
    readingText: post.readingText ?? null,
  }));

  // Hero categories
  type CategoryNode = { id: string; name: string; slug: string };
  const allCategories = extractConnectionNodes<CategoryNode>(allCategoriesResp?.categories);
  const heroCategories = filterOutCEFRLevels(
    deduplicateCategories(filterHiddenCategories(allCategories)),
  ).slice(0, 7);

  // Latest posts slider
  const t = TRANSLATIONS[effectiveLocale];
  const latestPosts = ((latestPostsResp as { posts?: { nodes?: WPPostCard[] } }).posts?.nodes ??
    []) as WPPostCard[];
  const mappedLatest = latestPosts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
  }));

  // Success stories slider
  const successPosts = (successStoriesResp.posts ?? []) as WPPostCard[];
  const mappedSuccess = successPosts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
  }));

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <HeroWithFilters
          categories={heroCategories}
          initialPosts={mappedPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </section>

      {mappedSuccess.length > 0 && (
        <SuccessStoriesSlider
          posts={mappedSuccess}
          title={t.successStories}
          description={t.successStoriesDescription}
        />
      )}
      {mappedLatest.length > 0 && <LatestPostsSlider posts={mappedLatest} title={t.latestPosts} />}
      <CategoriesBlock locale={effectiveLocale} />
    </>
  );
}
