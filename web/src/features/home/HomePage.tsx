import { Suspense } from "react";
import CategoriesBlock from "@/features/categories/CategoriesBlock";
import CategoryPillsSkeleton from "@/features/categories/CategoryPillsSkeleton";
import LatestPostsSliderServer from "@/features/posts/LatestPostsSliderServer";
import { mapPostCardMeta } from "@/features/posts/postCardMeta";
import HeroWithFilters from "@/features/search/HeroWithFilters";
import SuccessStoriesSliderServer from "@/features/stories/SuccessStoriesSliderServer";
import { getAllCategories } from "@/server/wp/categories";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import { getPostsLightweight as getWpPostsLightweight } from "@/server/wp/posts";
import type { WPPostCard } from "@/server/wp/types";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import { deduplicateCategories, filterOutCEFRLevels } from "@/shared/lib/categoryUtils";
import { filterHiddenCategories } from "@/shared/lib/hiddenCategories";
import Section from "@/shared/ui/Section";

type CategoryNode = { id: string; name: string; slug: string };

async function fetchHomePosts(limit: number, locale?: Locale): Promise<WPPostCard[]> {
  try {
    const response = await getWpPostsLightweight({ first: limit, locale });
    return (response.posts?.nodes ?? []) as WPPostCard[];
  } catch (error) {
    console.error("Failed to fetch home posts:", error);
    return [];
  }
}

async function fetchHeroCategories(locale: Locale): Promise<CategoryNode[]> {
  try {
    const response = await getAllCategories({ first: 50, locale });
    const categoryNodes = extractConnectionNodes<CategoryNode>(response?.categories);

    return filterOutCEFRLevels(deduplicateCategories(filterHiddenCategories(categoryNodes))).slice(
      0,
      7,
    );
  } catch (error) {
    console.error("Failed to load hero categories:", error);
    return [];
  }
}

function HeroFiltersFallback() {
  return (
    <Section className="text-center" spacing="hero">
      <div
        aria-hidden="true"
        className="mx-auto mb-[var(--space-6)] h-32 max-w-4xl rounded-[var(--radius-2xl)] bg-[var(--sd-surface-soft)]"
      />
      <div
        aria-hidden="true"
        className="mx-auto mb-[var(--space-8)] h-6 max-w-xl rounded-full bg-[var(--sd-surface-soft)]"
      />
      <CategoryPillsSkeleton count={7} alignment="center" />
    </Section>
  );
}

function CategoriesBlockFallback() {
  return (
    <Section fullBleed spacing="md" tone="muted">
      <CategoryPillsSkeleton count={6} alignment="left" />
    </Section>
  );
}

type HomePageProps = {
  locale?: Locale;
};

type HeroSectionProps = {
  locale: Locale;
  pageSize: number;
};

async function HeroSection({ locale, pageSize }: HeroSectionProps) {
  const initialPostsLimit = pageSize * 2;

  const [posts, categories] = await Promise.all([
    fetchHomePosts(initialPostsLimit, locale),
    fetchHeroCategories(locale),
  ]);
  const mappedPosts = posts.map((post) => mapPostCardMeta(post, locale));

  return (
    <HeroWithFilters
      categories={categories}
      initialPosts={mappedPosts}
      locale={locale}
      pageSize={pageSize}
    />
  );
}

export default async function HomePage({ locale }: HomePageProps = {}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const pageSize = 6;

  return (
    <>
      <Suspense fallback={<HeroFiltersFallback />}>
        <HeroSection locale={effectiveLocale} pageSize={pageSize} />
      </Suspense>

      <Suspense fallback={null}>
        <SuccessStoriesSliderServer locale={effectiveLocale} />
      </Suspense>
      <Suspense fallback={null}>
        <LatestPostsSliderServer locale={effectiveLocale} />
      </Suspense>
      <Suspense fallback={<CategoriesBlockFallback />}>
        <CategoriesBlock locale={effectiveLocale} />
      </Suspense>
    </>
  );
}
