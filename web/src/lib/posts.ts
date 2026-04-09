import { normalizeLevelSlug } from "@/lib/cefr";
import { buildLocalizedHref, DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import {
  getAllCategories,
  getAllPostsForCounts,
  getAllTags,
  getCategoryBySlug,
  getLatestPostsForRelated,
  getPostBySlug,
  getPosts,
  getPostsByCategory,
  getPostsByTag,
  getPostsByTagDatabaseId,
  getPostsByTagSlug,
  getPostsIndex,
  getPostsPageByCategory,
  getPostsPageFiltered,
  getRelatedPostsByCategorySlug,
  getRelatedPostsByTagSlug,
  getTagBySlug,
  mapGraphQLEnumToUi,
  type PostDetail,
  type PostListItem,
  type PostsConnectionResponse,
  searchPosts,
  type Tag,
  type Term,
  type WPPostCard,
} from "@/server/wp";

export {
  getAllCategories,
  getAllTags,
  getAllPostsForCounts,
  getCategoryBySlug,
  getLatestPostsForRelated,
  getPostBySlug,
  getPosts,
  getPostsByCategory,
  getPostsByTag,
  getPostsByTagSlug,
  getPostsByTagDatabaseId,
  getPostsIndex,
  getPostsPageByCategory,
  getPostsPageFiltered,
  getRelatedPostsByCategorySlug,
  getRelatedPostsByTagSlug,
  getTagBySlug,
  searchPosts,
};

export type { PostDetail, PostListItem, PostsConnectionResponse, Tag, Term, WPPostCard };
export { mapGraphQLEnumToUi };
export { normalizeLevelSlug };

export type PostsPageInfo = { endCursor: string | null; hasNextPage: boolean };

export type SearchPageResult = {
  pageInfo: PostsPageInfo;
  posts: WPPostCard[];
};

export type WordPressBadge = Tag;

/** Maps a UI locale to the WordPress/Polylang GraphQL language enum value. */
export function getWordPressLanguage(locale: Locale): "EN" | "RU" | "UK" {
  if (locale === "ru") {
    return "RU";
  }

  if (locale === "uk") {
    return "UK";
  }

  return "EN";
}

/**
 * Returns `true` when a search query should be skipped.
 * Avoids false matches by rejecting Latin-only queries for RU/UK locales.
 */
export function shouldSkipSearch(query: string, locale: Locale): boolean {
  return (locale === "uk" || locale === "ru") && /^[a-zA-Z0-9\s\-_.,!?]+$/.test(query);
}

/** Fetches paginated search results, respecting locale-specific skip rules. */
export async function getSearchPageResults(params: {
  after?: string | null;
  first?: number;
  locale: Locale;
  query: string;
}): Promise<SearchPageResult> {
  const { after = null, first = 10, locale, query } = params;
  const trimmedQuery = query.trim();

  if (!trimmedQuery || shouldSkipSearch(trimmedQuery, locale)) {
    return {
      pageInfo: { endCursor: null, hasNextPage: false },
      posts: [],
    };
  }

  return searchPosts({
    after,
    first,
    language: getWordPressLanguage(locale),
    locale,
    query: trimmedQuery,
  });
}

/** Fetches the initial set of posts for the homepage hero/grid. */
export async function getHomePagePosts(
  locale: Locale = DEFAULT_LOCALE,
  pageSize = 6,
): Promise<{ pageInfo: PostsPageInfo; posts: WPPostCard[] }> {
  const response = await getPosts({ first: pageSize * 2, locale });

  return {
    pageInfo: response.posts?.pageInfo ?? { endCursor: null, hasNextPage: false },
    posts: (response.posts?.nodes ?? []) as WPPostCard[],
  };
}

function getTagUriPrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/tag/" : `/${locale}/tag/`;
}

export function filterWordPressBadgesByLocale<T extends { uri?: string | null }>(
  tags: T[],
  locale: Locale,
): T[] {
  const prefix = getTagUriPrefix(locale);
  return tags.filter((tag) => typeof tag.uri === "string" && tag.uri.startsWith(prefix));
}

export async function getWordPressLevelBadges(locale: Locale): Promise<WordPressBadge[]> {
  const response = await getAllTags({ first: 200, locale });
  return filterWordPressBadgesByLocale(extractConnectionNodes<Tag>(response?.tags), locale);
}

function normalizeTermSlug(slug?: string | null): string | null {
  const normalized = String(slug ?? "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return normalized || null;
}

export function buildLocaleLevelHref(
  locale: Locale,
  slug: string | null | undefined,
): string | null {
  const normalizedSlug = normalizeTermSlug(slug);
  return normalizedSlug ? buildLocalizedHref(locale, `/levels/${normalizedSlug}`) : null;
}

export function buildLevelTranslationMap(
  term: Pick<Tag, "slug" | "language" | "translations">,
  currentLocale: Locale,
): Record<Locale, string | null> {
  const links: Record<Locale, string | null> = { en: null, ru: null, uk: null };
  const currentTermLocale = mapGraphQLEnumToUi(term.language?.code) ?? currentLocale;
  const currentTermHref = buildLocaleLevelHref(currentTermLocale, normalizeLevelSlug(term.slug));

  if (currentTermHref) {
    links[currentTermLocale] = currentTermHref;
  }

  for (const translation of term.translations ?? []) {
    const uiLocale = mapGraphQLEnumToUi(translation.language?.code);
    const href = buildLocaleLevelHref(uiLocale, normalizeLevelSlug(translation.slug));
    if (href) {
      links[uiLocale] = href;
    }
  }

  if (!links[currentLocale]) {
    links[currentLocale] = buildLocaleLevelHref(currentLocale, normalizeLevelSlug(term.slug));
  }

  return links;
}

/**
 * Builds a fully-qualified locale-prefixed href for a single post.
 * @example buildLocalePostHref("ru", "hello") // "/ru/posts/hello"
 */
export function buildLocalePostHref(locale: Locale, slug: string): string {
  return buildLocalizedHref(locale, `/posts/${slug}`);
}

/**
 * Appends a locale suffix to a taxonomy slug for locale-specific WP tags/categories.
 * The default locale uses the bare slug; others get `-ru` / `-uk`.
 */
export function getLocaleAwareTaxonomySlug(slug: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? slug : `${slug}-${locale}`;
}

/**
 * Normalizes a CEFR level slug to its canonical lowercase form (a1–c2).
 * Returns `null` if the slug does not contain a valid CEFR level.
 */
/** Returns `true` if the category should be hidden from public UI (language names, "blog", etc.). */
export function isHiddenCategory(name?: string | null, slug?: string | null) {
  const hiddenKeys = [
    "english",
    "russian",
    "ukrainian",
    "українська",
    "русский",
    "английский",
    "англ",
    "blog",
  ] as const;
  const nameLower = (name ?? "").toLowerCase();
  const slugLower = (slug ?? "").toLowerCase();

  return hiddenKeys.some(
    (key) => nameLower.includes(key) || slugLower === key || slugLower.includes(key),
  );
}

/** Filters out categories that should be hidden from public-facing UI. */
export function filterHiddenCategories<T extends { name?: string | null; slug?: string | null }>(
  categories: T[] | null | undefined,
): T[] {
  return Array.isArray(categories)
    ? categories.filter((category) => !isHiddenCategory(category.name, category.slug))
    : [];
}

/** Removes duplicate Cyrillic-named categories, keeping only the Latin variant. */
export function deduplicateCategories<T extends { name: string }>(categories: T[]): T[] {
  return categories.filter((category) => !/[\u0400-\u04FF]/.test(category.name ?? ""));
}

/** Removes CEFR level tags (A1–C2) from a category/tag list. */
export function filterOutCEFRLevels<T extends { slug: string }>(categories: T[]): T[] {
  return categories.filter((category) => normalizeLevelSlug(category.slug) === null);
}

/** Extracts node items from a WPGraphQL connection, handling both `nodes` and `edges` shapes. */
export function extractConnectionNodes<T>(
  connection:
    | {
        edges?: Array<{ node?: T | null } | null> | null;
        nodes?: Array<T | null> | null;
      }
    | null
    | undefined,
): T[] {
  if (!connection) {
    return [];
  }

  if (Array.isArray(connection.nodes)) {
    return connection.nodes.filter((node): node is T => Boolean(node));
  }

  if (Array.isArray(connection.edges)) {
    return connection.edges.map((edge) => edge?.node).filter((node): node is T => Boolean(node));
  }

  return [];
}

/**
 * Generates a table of contents from HTML headings and returns
 * the modified HTML (with `id` attributes) plus the TOC entries.
 */
export function generateTocFromHtml(html: string) {
  const toc: Array<{ depth: number; id: string; text: string }> = [];
  const seen: Record<string, number> = {};

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const nextHtml = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (full, level, attrs, inner) => {
      const depth = Number(level);
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) {
        return full;
      }

      let id = slugify(text) || `section-${toc.length + 1}`;
      seen[id] = (seen[id] ?? 0) + 1;
      if (seen[id] > 1) {
        id = `${id}-${seen[id]}`;
      }

      toc.push({ depth, id, text });
      const attrsWithoutId = (attrs || "").replace(/\s+id=("[^"]*"|'[^']*'|[^\s>]*)/i, "");
      return `<h${level} id="${id}"${attrsWithoutId}>${inner}</h${level}>`;
    },
  );

  return { html: nextHtml, toc };
}
