import type { ReactElement } from "react";
import { CEFR_SLUGS } from "@/core/cefr/levels";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import type { WPPostCard } from "@/server/wp/api";
import { getAllTags, getPostsByTagDatabaseId } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import CategoriesBlockClient from "./CategoriesBlockClient";

type TagNode = { id: string; databaseId?: number; name: string; slug: string };
type Category = {
  id: string;
  name: string;
  slug: string;
  tagDatabaseId: number;
  canonicalTagDatabaseId: number;
};
type PageInfo = { endCursor: string | null; hasNextPage: boolean };
const LEVEL_CODES = CEFR_SLUGS.map((slug) => slug.toLowerCase());

function getLevelSlugCandidates(levelCode: string, locale: Locale) {
  if (locale === "ru") return [`${levelCode}-ru`, levelCode];
  if (locale === "uk") return [`${levelCode}-uk`, levelCode];
  return [levelCode];
}

function resolveLevelCategories(tags: TagNode[], locale: Locale): Category[] {
  const tagsBySlug = new Map(tags.map((tag) => [tag.slug.toLowerCase(), tag]));

  const resolved: Category[] = [];
  for (const levelCode of LEVEL_CODES) {
    const canonical = tagsBySlug.get(levelCode);
    const localized = getLevelSlugCandidates(levelCode, locale)
      .map((candidate) => tagsBySlug.get(candidate))
      .find((tag): tag is TagNode => Boolean(tag));
    const picked = localized ?? canonical;

    if (!picked || !picked.databaseId) {
      if (process.env.NODE_ENV !== "production") {
        console.error(
          `[levels] Could not resolve tag for level "${levelCode}" in locale "${locale}".`,
        );
      }
      continue;
    }

    if (!localized && process.env.NODE_ENV !== "production") {
      console.warn(
        `[levels] Locale-specific tag missing for "${levelCode}" in "${locale}", falling back to canonical.`,
      );
    }

    resolved.push({
      id: picked.id,
      name: picked.name,
      slug: levelCode,
      tagDatabaseId: picked.databaseId,
      canonicalTagDatabaseId: canonical?.databaseId ?? picked.databaseId,
    });
  }

  return resolved;
}

/**
 * Server component: fetches categories and a small posts page, then
 * renders the client component that provides interactivity.
 */
export default async function CategoriesBlock({
  locale,
}: {
  locale?: Locale;
} = {}): Promise<ReactElement> {
  const effectiveLocale: Locale = locale ?? DEFAULT_LOCALE;

  // Fetch enough tags to ensure we get all CEFR level tags (A1-C2)
  // Increased from 12 to 50 to make sure A1 and C1 are included
  const tagsResp = await getAllTags({ first: 200 });
  const tags = extractConnectionNodes<TagNode>(tagsResp?.tags).map((t) => ({
    id: t.id,
    databaseId: t.databaseId,
    name: t.name,
    slug: t.slug,
  }));

  const visibleCategories: Category[] = resolveLevelCategories(tags, effectiveLocale);

  const preferredInitialCategory =
    visibleCategories.find((category) => category.slug.toLowerCase() === "a1")?.slug ??
    visibleCategories[0]?.slug ??
    null;

  // Server-render initial posts for the initial selected level to avoid client-side filling
  // after locale navigation.
  let initialPosts: WPPostCard[] = [];
  const pageInfo: PageInfo = { endCursor: null, hasNextPage: false };
  if (preferredInitialCategory && visibleCategories.length > 0) {
    const selectedCategory = visibleCategories.find(
      (category) => category.slug === preferredInitialCategory,
    );
    if (!selectedCategory && process.env.NODE_ENV !== "production") {
      console.error(
        `[levels] Preferred level "${preferredInitialCategory}" is missing in resolved categories for locale "${effectiveLocale}".`,
      );
    }

    if (!selectedCategory) {
      return (
        <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
          <section
            aria-label={TRANSLATIONS[effectiveLocale].levels}
            data-categories-scope
            className="mx-auto max-w-7xl px-4 py-10 text-white"
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold mb-8">
                {TRANSLATIONS[effectiveLocale].levelsHeading}
              </h2>
              <p className="text-base leading-relaxed text-gray-300 max-w-2xl">
                {TRANSLATIONS[effectiveLocale].levelsDescription}
              </p>
            </div>
          </section>
        </div>
      );
    }

    try {
      let initialPostsRes = await getPostsByTagDatabaseId(
        selectedCategory.tagDatabaseId,
        100,
        undefined,
        effectiveLocale,
      );
      initialPosts = (initialPostsRes.posts?.nodes ?? []) as WPPostCard[];

      if (
        initialPosts.length === 0 &&
        selectedCategory.canonicalTagDatabaseId !== selectedCategory.tagDatabaseId
      ) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[levels] No posts for locale tagId=${selectedCategory.tagDatabaseId}; falling back to canonical tagId=${selectedCategory.canonicalTagDatabaseId}.`,
          );
        }
        initialPostsRes = await getPostsByTagDatabaseId(
          selectedCategory.canonicalTagDatabaseId,
          100,
          undefined,
          effectiveLocale,
        );
        initialPosts = (initialPostsRes.posts?.nodes ?? []) as WPPostCard[];
      }
    } catch (error) {
      console.error("Failed to load initial level posts:", error);
    }
  }

  return (
    // Match success stories slider background (full-bleed dark band)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section
        aria-label={TRANSLATIONS[effectiveLocale].levels}
        data-categories-scope
        className="mx-auto max-w-7xl px-4 py-10 text-white"
      >
        <style>{`
          [data-categories-scope] h1,
          [data-categories-scope] h2,
          [data-categories-scope] h3,
          [data-categories-scope] h4,
          [data-categories-scope] h5,
          [data-categories-scope] h6,
          [data-categories-scope] h1 *,
          [data-categories-scope] h2 *,
          [data-categories-scope] h3 *,
          [data-categories-scope] h4 *,
          [data-categories-scope] h5 *,
          [data-categories-scope] h6 *,
          [data-categories-scope] .post-title,
          [data-categories-scope] [data-post-title],
          [data-categories-scope] .prose :where(h1,h2,h3,h4,h5,h6),
          [data-categories-scope] .prose :where(h1,h2,h3,h4,h5,h6) a {
            color: #ffffff !important;
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
            will-change: color;
          }
          [data-categories-scope] .group:hover h1,
          [data-categories-scope] .group:hover h2,
          [data-categories-scope] .group:hover h3,
          [data-categories-scope] .group:hover h4,
          [data-categories-scope] .group:hover h5,
          [data-categories-scope] .group:hover h6,
          [data-categories-scope] .group:focus-within h1,
          [data-categories-scope] .group:focus-within h2,
          [data-categories-scope] .group:focus-within h3,
          [data-categories-scope] .group:focus-within h4,
          [data-categories-scope] .group:focus-within h5,
          [data-categories-scope] .group:focus-within h6,
          [data-categories-scope] .group:hover h1 *,
          [data-categories-scope] .group:hover h2 *,
          [data-categories-scope] .group:hover h3 *,
          [data-categories-scope] .group:hover h4 *,
          [data-categories-scope] .group:hover h5 *,
          [data-categories-scope] .group:hover h6 *,
          [data-categories-scope] .group:focus-within h1 *,
          [data-categories-scope] .group:focus-within h2 *,
          [data-categories-scope] .group:focus-within h3 *,
          [data-categories-scope] .group:focus-within h4 *,
          [data-categories-scope] .group:focus-within h5 *,
          [data-categories-scope] .group:focus-within h6 * {
            color: #d1d5db !important; /* gray-300 */
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
          }
        `}</style>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold mb-8">
            {TRANSLATIONS[effectiveLocale].levelsHeading}
          </h2>
          <p className="text-base leading-relaxed text-gray-300 max-w-2xl">
            {TRANSLATIONS[effectiveLocale].levelsDescription}
          </p>
        </div>

        {/* Client component gets serializable props only */}
        <div className="mt-8">
          <CategoriesBlockClient
            categories={visibleCategories}
            initialSelectedCategory={preferredInitialCategory}
            initialPosts={initialPosts}
            initialEndCursor={pageInfo.endCursor}
            initialHasNextPage={pageInfo.hasNextPage}
            pageSize={3}
            locale={effectiveLocale}
          />
        </div>
      </section>
    </div>
  );
}
