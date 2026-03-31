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
  type PostDetail,
  type PostListItem,
  type PostsConnectionResponse,
  searchPosts,
  type Tag,
  type Term,
  type WPPostCard,
} from "@/server/wp/index";
import { mapGraphQLEnumToUi } from "@/server/wp/types";

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

export type PostsPageInfo = { endCursor: string | null; hasNextPage: boolean };

export type SearchPageResult = {
  pageInfo: PostsPageInfo;
  posts: WPPostCard[];
};

export function getWordPressLanguage(locale: Locale): "EN" | "RU" | "UK" {
  if (locale === "ru") {
    return "RU";
  }

  if (locale === "uk") {
    return "UK";
  }

  return "EN";
}

export function shouldSkipSearch(query: string, locale: Locale): boolean {
  return (locale === "uk" || locale === "ru") && /^[a-zA-Z0-9\s\-_.,!?]+$/.test(query);
}

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

export function buildLocalePostHref(locale: Locale, slug: string): string {
  return buildLocalizedHref(locale, `/posts/${slug}`);
}

export function getLocaleAwareTaxonomySlug(slug: string, locale: Locale): string {
  return locale === DEFAULT_LOCALE ? slug : `${slug}-${locale}`;
}

export function normalizeLevelSlug(slug?: string | null): string | null {
  if (!slug) {
    return null;
  }

  const normalized = slug.toLowerCase().trim().replace(/_/g, "-");
  const cleaned = normalized
    .replace(/^(?:cefrlevel-)/, "")
    .replace(/^(?:cefr-)/, "")
    .replace(/^(?:level-)/, "")
    .replace(/^(?:ger-)/, "");
  const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (["a1", "a2", "b1", "b2", "c1", "c2"].includes(token)) {
      return token;
    }
  }

  if (/\bc2\b/.test(cleaned)) return "c2";
  if (/\bc1\b/.test(cleaned)) return "c1";
  if (/\bb2\b/.test(cleaned)) return "b2";
  if (/\bb1\b/.test(cleaned)) return "b1";
  if (/\ba2\b/.test(cleaned)) return "a2";
  if (/\ba1\b/.test(cleaned)) return "a1";
  return null;
}

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

export function filterHiddenCategories<T extends { name?: string | null; slug?: string | null }>(
  categories: T[] | null | undefined,
): T[] {
  return Array.isArray(categories)
    ? categories.filter((category) => !isHiddenCategory(category.name, category.slug))
    : [];
}

export function deduplicateCategories<T extends { name: string }>(categories: T[]): T[] {
  return categories.filter((category) => !/[\u0400-\u04FF]/.test(category.name ?? ""));
}

export function filterOutCEFRLevels<T extends { slug: string }>(categories: T[]): T[] {
  return categories.filter((category) => normalizeLevelSlug(category.slug) === null);
}

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
