npmimport { Suspense } from "react";
import dynamic from "next/dynamic";
import CategoriesBlock from "@/components/categories-block";
import { CategoryPillsSkeleton } from "@/components/cards";
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
  getPosts,
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

// First animated keyword per locale — shown in the static hero skeleton.
const HERO_FIRST_KEYWORD: Record<string, string> = {
  en: "work",
  uk: "роботи",
  ru: "работы",
};

export const revalidate = 60;

// ---------------------------------------------------------------------------
// PostCard-shaped skeleton — matches real PostCard aspect ratio so that
// placeholder height equals real card height and prevents CLS on swap.
// ---------------------------------------------------------------------------
function PostCardSkeleton() {
  return (
    <div>
      <div className="relative aspect-[4/3] rounded-2xl sd-skeleton" />
      <div className="mt-4 h-3 w-24 rounded-full sd-skeleton" />
      <div className="mt-2 h-5 w-3/4 rounded-full sd-skeleton" />
      <div className="mt-1 h-5 w-1/2 rounded-full sd-skeleton" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static hero skeleton — included in the initial HTML stream as the Suspense
// fallback. Renders the LCP-critical h1 immediately (no data required) and
// uses same-height placeholders for dynamic content to avoid CLS on swap.
// ---------------------------------------------------------------------------
function HeroFallback({ locale }: { locale: Locale }) {
  const t = TRANSLATIONS[locale];
  const firstWord = HERO_FIRST_KEYWORD[locale] ?? HERO_FIRST_KEYWORD.en;

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <section className="text-center max-w-7xl mx-auto px-4 pt-12 sm:pt-14 md:pt-16 pb-0">
          <h1 className="m-0 p-0 text-center font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1] tracking-tight text-[hsl(var(--fg))] dark:text-[hsl(var(--fg))] select-text">
            {t["heroLine1"]}
            <br />
            {t["heroLine2"]}
            <br />
            <span className="inline-block whitespace-nowrap align-baseline select-text font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.06] sm:leading-[1.06] md:leading-[1.1] text-blue-600">
              {firstWord}
            </span>
          </h1>
          <p className="mt-6 sm:mt-8 mx-auto max-w-xl text-center text-[hsl(var(--fg-muted))] text-base sm:text-lg leading-relaxed">
            {t["heroDescription"]}{" "}
            <a className="inline text-blue-600 underline" href="#top">
              {t["promoCta"]}
            </a>
          </p>
          <CategoryPillsSkeleton count={6} />
        </section>
        <section className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Async data-fetching component — all WP API calls happen here, deferred
// behind the Suspense boundary so the static skeleton is painted first.
// ---------------------------------------------------------------------------
async function HomePageContent({ locale }: { locale: Locale }) {
  const PAGE_SIZE = 6;

  // Fetch all home-page data in parallel
  const [{ posts, pageInfo }, allCategoriesResp, latestPostsResp, successStoriesResp] =
    await Promise.all([
      getHomePagePosts(locale, PAGE_SIZE),
      getAllCategories({ first: 50, locale }).catch(() => null),
      getPosts({ first: 8, locale }).catch(() => ({ posts: { nodes: [] } })),
      getPostsByCategory({
        first: 8,
        after: null,
        locale,
        categorySlug:
          locale === "uk"
            ? "success-stories-uk"
            : locale === "ru"
              ? "success-stories-ru"
              : "success-stories",
      }).catch(() => ({ posts: [] })),
    ]);

  const mappedPosts = posts.map((post) => ({
    ...post,
    dateText: formatPostCardDate(post.date, locale),
    href: buildLocalePostHref(locale, post.slug),
    readingText: post.readingText ?? null,
  }));

  // Hero categories
  type CategoryNode = { id: string; name: string; slug: string };
  const allCategories = extractConnectionNodes<CategoryNode>(allCategoriesResp?.categories);
  const heroCategories = filterOutCEFRLevels(
    deduplicateCategories(filterHiddenCategories(allCategories)),
  ).slice(0, 7);

  // Latest posts slider
  const t = TRANSLATIONS[locale];
  const latestPosts = ((latestPostsResp as { posts?: { nodes?: WPPostCard[] } }).posts?.nodes ??
    []) as WPPostCard[];
  const mappedLatest = latestPosts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, locale),
    href: buildLocalePostHref(locale, post.slug),
  }));

  // Success stories slider — strip the success-story category chips here on
  // the server so SuccessStoriesSlider doesn't need a useMemo for this work.
  const successPosts = (successStoriesResp.posts ?? []) as WPPostCard[];
  const mappedSuccess = successPosts.map((post) => ({
    ...post,
    readingText: post.readingText ?? null,
    dateText: formatPostCardDate(post.date, locale),
    href: buildLocalePostHref(locale, post.slug),
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
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={PAGE_SIZE}
          locale={locale}
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
      <CategoriesBlock locale={locale} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Page entry point — synchronous so the hero skeleton is included in the
// initial HTML stream while real data loads behind a Suspense boundary.
// ---------------------------------------------------------------------------
export default function HomePage({ locale }: { locale?: Locale } = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;

  return (
    <Suspense fallback={<HeroFallback locale={effectiveLocale} />}>
      <HomePageContent locale={effectiveLocale} />
    </Suspense>
  );
}
