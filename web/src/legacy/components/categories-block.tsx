import dynamic from "next/dynamic";
import type { ReactElement } from "react";
import { sortWordPressBadgesByCefr } from "@/lib/cefr";
import { DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { getPostsByTagDatabaseId, getWordPressLevelBadges, type WPPostCard } from "@/lib/posts";

// Code-split CategoriesBlockClient (the interactive WordPress badge tabs + posts grid).
// It sits at the very bottom of the homepage; deferring its JS lets React
// prioritise hydration of above-fold content first.
const CategoriesBlockClient = dynamic(() => import("./categories-block-client"));

type WordPressBadge = {
  id: string;
  databaseId?: number;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
  uri?: string;
  levelColor?: string | null;
};

/**
 * Server component: fetches WordPress badges and a small posts page, then
 * renders the client component that provides interactivity.
 */
export default async function CategoriesBlock({
  locale,
}: {
  locale?: Locale;
} = {}): Promise<ReactElement> {
  const effectiveLocale: Locale = locale ?? DEFAULT_LOCALE;
  const visibleCategories: WordPressBadge[] = sortWordPressBadgesByCefr(
    await getWordPressLevelBadges(effectiveLocale),
  );
  const preferredInitialCategory = visibleCategories[0]?.slug ?? null;

  // Server-render initial posts for the initial selected badge to avoid client-side filling
  // after locale navigation.
  let initialPosts: WPPostCard[] = [];

  if (preferredInitialCategory && visibleCategories.length > 0) {
    const selectedCategory = visibleCategories.find(
      (category) => category.slug === preferredInitialCategory,
    );

    if (!selectedCategory && process.env.NODE_ENV !== "production") {
      console.error(
        `[levels] Preferred badge "${preferredInitialCategory}" is missing from the WordPress badge payload for locale "${effectiveLocale}".`,
      );
    }

    if (!selectedCategory) {
      return (
        <div className="bg-gradient-section -mx-[calc(50vw-50%)] w-screen">
          <section
            aria-label={TRANSLATIONS[effectiveLocale].levels}
            data-categories-scope
            className="mx-auto max-w-7xl px-4 py-10 dark:text-white"
          >
            <div className="space-y-2">
              <h2 className="type-title mb-8">{TRANSLATIONS[effectiveLocale].levelsHeading}</h2>
              <p className="type-lead max-w-2xl text-neutral-600 dark:text-gray-300">
                {TRANSLATIONS[effectiveLocale].levelsDescription}
              </p>
            </div>
          </section>
        </div>
      );
    }

    try {
      const initialPostsRes = await getPostsByTagDatabaseId(
        selectedCategory.databaseId ?? 0,
        12,
        undefined,
        effectiveLocale,
      );
      initialPosts = (initialPostsRes.posts?.nodes ?? []) as WPPostCard[];
    } catch (error) {
      console.error("Failed to load initial level posts:", error);
    }
  }

  return (
    <div className="bg-gradient-section -mx-[calc(50vw-50%)] w-screen">
      <section
        aria-label={TRANSLATIONS[effectiveLocale].levels}
        data-categories-scope
        className="mx-auto max-w-7xl px-4 py-10 dark:text-white"
      >
        <div className="space-y-2">
          <h2 className="type-title mb-8">{TRANSLATIONS[effectiveLocale].levelsHeading}</h2>
          <p className="type-lead max-w-2xl text-neutral-600 dark:text-gray-300">
            {TRANSLATIONS[effectiveLocale].levelsDescription}
          </p>
        </div>

        <div className="mt-8">
          <CategoriesBlockClient
            categories={visibleCategories}
            initialSelectedCategory={preferredInitialCategory}
            initialPosts={initialPosts}
            pageSize={3}
            locale={effectiveLocale}
          />
        </div>
      </section>
    </div>
  );
}
