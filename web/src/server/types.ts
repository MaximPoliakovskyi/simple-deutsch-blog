import { isLocale, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n";
import type { CachePolicy } from "./client";

export type NextInit = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
  locale?: Locale;
  policy?: CachePolicy;
};

export type Term = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
};

export type Tag = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string | null;
  count: number;
  uri: string;
};

export type WPImage = {
  sourceUrl: string;
  altText: string | null;
  mediaDetails?: { width?: number; height?: number } | null;
};

export type WPAuthor = { name: string; slug: string };

export type PostLanguage = {
  code: "EN" | "RU" | "UK";
  slug: Locale;
  locale: string;
};

export type PostTranslation = {
  databaseId: number;
  slug: string;
  uri: string;
  language: PostLanguage;
};

// --- Polylang helpers ---

export type PolylangTranslation = {
  id: number;
  slug: string;
  uri?: string;
};

export const mapUiToGraphQLEnum = (locale: Locale | null | undefined): "EN" | "RU" | "UK" => {
  if (!locale) return "EN";
  if (locale === "ru") return "RU";
  if (locale === "uk") return "UK";
  return "EN";
};

export const mapGraphQLEnumToUi = (code: string | null | undefined): Locale => {
  if (!code) return "en";
  if (code === "RU") return "ru";
  if (code === "UK") return "uk";
  return "en";
};

export function parseTranslations(
  raw: string | null | undefined,
): Partial<Record<Locale, PolylangTranslation>> {
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== "object") return {};

    const result: Partial<Record<Locale, PolylangTranslation>> = {};
    const validLangSet = new Set<Locale>(SUPPORTED_LOCALES);

    for (const [lang, value] of Object.entries(parsed)) {
      if (!isLocale(lang) || !validLangSet.has(lang)) continue;
      if (!value || typeof value !== "object") continue;
      const obj = value as Record<string, unknown>;
      const maybeId = obj.id;
      const maybeSlug = obj.slug;
      const maybeUri = obj.uri;
      if (typeof maybeId !== "number") continue;
      if (typeof maybeSlug !== "string") continue;
      result[lang] = {
        id: maybeId,
        slug: maybeSlug,
        uri: typeof maybeUri === "string" ? maybeUri : undefined,
      };
    }
    return result;
  } catch {
    return {};
  }
}

export type PostListItem = {
  id: string;
  databaseId?: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  content?: string | null;
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  featuredImageUrl?: string | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> };
  tags?: { nodes: Array<{ name: string; slug: string }> };
  language?: PostLanguage | null;
  translations?: PostTranslation[] | null;
  readingMinutes?: number | null;
  readingWords?: number | null;
  readingWordsPerMinute?: number | null;
  readingText?: string | null;
};

export type Connection<TNode> = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Array<TNode>;
};

export type PostDetail = PostListItem & {
  content: string | null;
  seo?: { title?: string | null; metaDesc?: string | null } | null;
};

export type WPPostCard = {
  id: string;
  databaseId?: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string | null;
  date: string;
  featuredImage?: { node?: WPImage | null } | null;
  featuredImageUrl?: string | null;
  author?: { node?: WPAuthor | null } | null;
  categories?: { nodes: { id?: string; name: string; slug: string }[] };
  language?: PostLanguage | null;
  readingMinutes?: number | null;
  readingWords?: number | null;
  readingWordsPerMinute?: number | null;
  readingText?: string | null;
};

export type PostsConnectionResponse = {
  posts: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ cursor: string; node: WPPostCard }>;
  };
};

export type SearchPostsArgs = {
  query: string;
  first?: number;
  after?: string | null;
  language?: "EN" | "RU" | "UK" | null;
  locale?: Locale;
};
