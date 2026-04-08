import dynamic from "next/dynamic";
import { Suspense } from "react";
import { CategoryPillsSkeleton } from "@/components/cards";
import CategoriesBlock from "@/components/categories-block";
import HeroWithFilters from "@/components/hero";
import {
  getHeroStableWidthCh,
  getHeroStaticLineClassNames,
  HERO_KEYWORDS,
} from "@/components/hero-content";
import { HERO_DESCRIPTION_CLASS_NAME, HERO_TITLE_CLASS_NAME } from "@/components/hero-styles";
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
// SliderSectionSkeleton — height-matching placeholder for the two horizontal
// sliders (SuccessStoriesSlider and LatestPostsSlider).  The skeleton uses the
// same container/padding classes and the same [data-card] attribute so that
// the globals.css responsive flex-basis rules give the skeleton cards exactly
// the same width (and therefore height via aspect-[4/3]) as the real cards.
// ---------------------------------------------------------------------------
function SliderSectionSkeleton({
  gradient = false,
  withDescription = false,
}: {
  gradient?: boolean;
  withDescription?: boolean;
}) {
  return (
    <div
      className={`${gradient ? "bg-gradient-section" : ""} -mx-[calc(50vw-50%)] w-screen`}
      aria-hidden="true"
    >
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-9 w-52 rounded-md sd-skeleton" />
          <div className="flex gap-2">
            <div className="h-10 w-10 rounded-full sd-skeleton" />
            <div className="h-10 w-10 rounded-full sd-skeleton" />
          </div>
        </div>
        {withDescription && <div className="mb-8 h-12 max-w-2xl rounded-md sd-skeleton" />}
        <div className="flex gap-8 overflow-hidden pt-2 pb-4">
          {/* Card 1 — always visible */}
          <div data-card>
            <div className="relative aspect-[4/3] rounded-2xl sd-skeleton" />
            <div className="mt-4 h-3 w-24 rounded-full sd-skeleton" />
            <div className="mt-2 h-5 w-3/4 rounded-full sd-skeleton" />
            <div className="mt-1 h-5 w-1/2 rounded-full sd-skeleton" />
          </div>
          {/* Card 2 — visible at md+ */}
          <div data-card className="hidden md:block">
            <div className="relative aspect-[4/3] rounded-2xl sd-skeleton" />
            <div className="mt-4 h-3 w-24 rounded-full sd-skeleton" />
            <div className="mt-2 h-5 w-3/4 rounded-full sd-skeleton" />
            <div className="mt-1 h-5 w-1/2 rounded-full sd-skeleton" />
          </div>
          {/* Card 3 — visible at xl+ */}
          <div data-card className="hidden xl:block">
            <div className="relative aspect-[4/3] rounded-2xl sd-skeleton" />
            <div className="mt-4 h-3 w-24 rounded-full sd-skeleton" />
            <div className="mt-2 h-5 w-3/4 rounded-full sd-skeleton" />
            <div className="mt-1 h-5 w-1/2 rounded-full sd-skeleton" />
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoriesBlockSkeleton — height-matching placeholder for CategoriesBlock.
// Mirrors the bg-gradient-section wrapper, py-10 padding, heading+description
// block, CategoryPills row (alignment="left"), and the 3-column post grid.
// ---------------------------------------------------------------------------
function CategoriesBlockSkeleton() {
  return (
    <div className="bg-gradient-section -mx-[calc(50vw-50%)] w-screen" aria-hidden="true">
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="space-y-2">
          <div className="mb-8 h-9 w-32 rounded-md sd-skeleton" />
          <div className="h-16 max-w-2xl rounded-md sd-skeleton" />
        </div>
        <div className="mt-8">
          <CategoryPillsSkeleton count={6} alignment="left" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6 py-2">
            {[0, 1, 2].map((i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static hero skeleton — included in the initial HTML stream as the Suspense
// fallback. Renders the LCP-critical h1 immediately (no data required) and
// uses same-height placeholders for ALL homepage sections (hero posts, sliders,
// categories block) so the footer never shifts when the boundary resolves.
// ---------------------------------------------------------------------------
function HeroFallback({ locale }: { locale: Locale }) {
  const t = TRANSLATIONS[locale];
  const firstWord = (HERO_KEYWORDS[locale] ?? HERO_KEYWORDS.en)[0];
  const stableWidthCh = getHeroStableWidthCh(locale);
  const staticLineClassNames = getHeroStaticLineClassNames(locale);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <section className="mx-auto max-w-7xl pt-0 pb-0 text-center sm:pt-14 md:pt-16">
          <div className="flex w-full justify-center">
            <h1
              className={`${HERO_TITLE_CLASS_NAME} ${staticLineClassNames.titleClassName} mb-6 sm:mb-8`}
            >
              <span className={staticLineClassNames.line1ClassName}>{t.heroLine1}</span>
              <span className={staticLineClassNames.line2ClassName}>{t.heroLine2}</span>
              <span className="mt-1 flex w-full justify-center sm:mt-2">
                <span
                  className="inline-flex items-baseline justify-center whitespace-nowrap align-baseline text-blue-600"
                  style={{ width: `${stableWidthCh}ch`, minWidth: `${stableWidthCh}ch` }}
                >
                  {firstWord}
                </span>
              </span>
            </h1>
          </div>
          <p className={HERO_DESCRIPTION_CLASS_NAME}>
            {t.heroDescription}{" "}
            <a className="inline text-blue-600 underline" href="#top">
              {t.promoCta}
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
          {/* Reserve space for the "Load more" button that appears after hydration */}
          <div className="mx-auto h-9 w-28 rounded-full sd-skeleton" aria-hidden="true" />
        </section>
      </section>

      {/*
        Reserve space for the three full-bleed sections that appear below the
        hero grid once the Suspense boundary resolves.  Without these, the
        footer jumps down ~1500 px causing CLS ≈ 0.436.
      */}
      <SliderSectionSkeleton gradient withDescription />
      <SliderSectionSkeleton />
      <CategoriesBlockSkeleton />
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
  const [{ posts }, allCategoriesResp, latestPostsResp, successStoriesResp] = await Promise.all([
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
