import type { CachePolicy } from "@/core/api/fetching";
import type { Locale } from "@/i18n/locale";

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
