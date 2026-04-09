import dynamic from "next/dynamic";
import CategoriesBlock from "@/components/categories-block";
import HeroWithFilters from "@/components/hero";
import { DEFAULT_LOCALE, formatPostCardDate, type Locale, TRANSLATIONS } from "@/lib/i18n";
import {
  buildLocalePostHref,
  deduplicateCategories,
  extractConnectionNodes,
  filterHiddenCategories,
  filterOutCEFRLevels,
  getAllCategories,
  getHomePagePosts,
  getPostsByCategory,
  type WPPostCard,
} from "@/lib/posts";

// Sliders are below the fold — code-split into separate chunks so the browser
// can defer their JS and React can selectively hydrate them after the hero.
const SuccessStoriesSlider = dynamic(() => import("@/components/success-stories-slider"));
const LatestPostsSlider = dynamic(() => import("@/components/latest-posts-slider"));

// Success-story category slugs filtered out server-side so the client
// component doesn't need a useMemo for this on every render.
const SUCCESS_STORY_SLUGS = new Set([
  "success-stories",
  "success-stories-uk",
  "success-stories-ru",
]);

export default async function HomePage({ locale }: { locale?: Locale } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const PAGE_SIZE = 6;

  const [{ posts }, allCategoriesResp, successStoriesResp] = await Promise.all([
    getHomePagePosts(effectiveLocale, PAGE_SIZE),
    getAllCategories({ first: 50, locale: effectiveLocale }).catch(() => null),
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

  type CategoryNode = { id: string; name: string; slug: string };
  const allCategories = extractConnectionNodes<CategoryNode>(allCategoriesResp?.categories);
  const heroCategories = filterOutCEFRLevels(
    deduplicateCategories(filterHiddenCategories(allCategories)),
  ).slice(0, 7);

  const t = TRANSLATIONS[effectiveLocale];
  const mappedLatest = mappedPosts.slice(0, 8);

  const successPosts = (successStoriesResp.posts ?? []) as WPPostCard[];
  const mappedSuccess = successPosts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, effectiveLocale),
    href: buildLocalePostHref(effectiveLocale, post.slug),
    categories: {
      nodes: (post.categories?.nodes ?? []).filter(
        (cat) => !SUCCESS_STORY_SLUGS.has(cat?.slug ?? ""),
      ),
    },
  }));

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <HeroWithFilters
          categories={heroCategories}
          initialPosts={mappedPosts}
          pageSize={PAGE_SIZE}
          locale={effectiveLocale}
        />
      </section>

      {mappedSuccess.length > 0 && (
        <SuccessStoriesSlider
          posts={mappedSuccess}
          title={t.successStories}
          description={t.successStoriesDescription}
          locale={effectiveLocale}
        />
      )}
      {mappedLatest.length > 0 && (
        <LatestPostsSlider posts={mappedLatest} title={t.latestPosts} locale={effectiveLocale} />
      )}
      <CategoriesBlock locale={effectiveLocale} />
    </>
  );
}
