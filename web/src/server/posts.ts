import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { CACHE_TAGS } from "@/server/cache";
import { fetchGraphQL } from "@/server/client";
import {
  GET_ALL_CATEGORIES,
  GET_ALL_TAGS,
  GET_CATEGORY_BY_SLUG,
  GET_POST_BY_DATABASE_ID,
  GET_POST_BY_SLUG,
  GET_POST_BY_URI,
  GET_POSTS,
  GET_POSTS_BY_CATEGORY,
  GET_POSTS_BY_CATEGORY_SLUG,
  GET_POSTS_BY_TAG,
  GET_POSTS_BY_TAG_DATABASE_ID,
  GET_POSTS_BY_TAG_SLUG,
  GET_POSTS_INDEX,
  GET_RELATED_LATEST_POSTS,
  GET_RELATED_POSTS_BY_CATEGORY_SLUG,
  GET_RELATED_POSTS_BY_TAG_SLUG,
  GET_TAG_BY_SLUG,
  POSTS_CONNECTION,
  SEARCH_POSTS,
} from "@/server/queries";
import type {
  Connection,
  NextInit,
  PostDetail,
  PostListItem,
  PostsConnectionResponse,
  SearchPostsArgs,
  Tag,
  Term,
  WPPostCard,
} from "@/server/types";
import { mapUiToGraphQLEnum } from "@/server/types";

function isSchemaMismatchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("GraphQL errors:")) return false;
  return /not defined by type|Unknown argument|Cannot query field|Unknown type/.test(message);
}

type ReadingLocale = Locale | "de" | string;

type ReadingTimeResult = {
  minutes: number;
  words: number;
  wordsPerMinute: number;
  text: string;
};

type ReadablePost = {
  content?: string | null;
  excerpt?: string | null;
};

const WORD_RE = /[\p{L}\p{N}]+(?:[-'][\p{L}\p{N}]+)*/gu;

function normalizeReadingLocale(locale?: ReadingLocale | null): "en" | "de" | "ru" | "uk" {
  const normalized = String(locale ?? "en").toLowerCase();
  if (normalized === "ua") return "uk";
  if (normalized.startsWith("ru")) return "ru";
  if (normalized.startsWith("uk")) return "uk";
  if (normalized.startsWith("de")) return "de";
  return "en";
}

function wordsPerMinuteForLocale(locale: "en" | "de" | "ru" | "uk"): number {
  if (locale === "en") return 220;
  return 200;
}

function decodeHtmlEntities(input: string): string {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
  };

  return input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (full, entity: string) => {
    const lower = entity.toLowerCase();
    if (lower.startsWith("#x")) {
      const value = Number.parseInt(lower.slice(2), 16);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }
    if (lower.startsWith("#")) {
      const value = Number.parseInt(lower.slice(1), 10);
      return Number.isFinite(value) ? String.fromCodePoint(value) : full;
    }
    return named[lower] ?? full;
  });
}

function htmlToVisibleText(html: string): string {
  const withoutCode = html
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, " ")
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, " ");

  const withoutNonContent = withoutCode
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ");

  const textOnly = withoutNonContent.replace(/<[^>]+>/g, " ");
  const decoded = decodeHtmlEntities(textOnly);
  return decoded.replace(/\s+/g, " ").trim();
}

function countWords(text: string): number {
  const matches = text.match(WORD_RE);
  return matches?.length ?? 0;
}

function pluralRuUk(value: number): "one" | "few" | "many" {
  const n10 = value % 10;
  const n100 = value % 100;
  if (n10 === 1 && n100 !== 11) return "one";
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return "few";
  return "many";
}

function formatReadingTime(minutes: number, locale: "en" | "de" | "ru" | "uk"): string {
  if (locale === "de") return `${minutes} Min. Lesezeit`;
  if (locale === "ru") {
    const form = pluralRuUk(minutes);
    const unit = form === "one" ? "минута" : form === "few" ? "минуты" : "минут";
    return `${minutes} ${unit} чтения`;
  }
  if (locale === "uk") {
    const form = pluralRuUk(minutes);
    const unit = form === "one" ? "хвилина" : form === "few" ? "хвилини" : "хвилин";
    return `${minutes} ${unit} читання`;
  }
  return `${minutes} min read`;
}

export function calculateReadingTimeFromHtml(
  html: string,
  locale?: ReadingLocale | null,
): ReadingTimeResult {
  const normalizedLocale = normalizeReadingLocale(locale);
  const wordsPerMinute = wordsPerMinuteForLocale(normalizedLocale);
  const words = countWords(htmlToVisibleText(html));
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));

  return {
    minutes,
    words,
    wordsPerMinute,
    text: formatReadingTime(minutes, normalizedLocale),
  };
}

export function withReadingTime<T extends ReadablePost>(post: T, locale?: ReadingLocale | null) {
  const sourceHtml = post.content ?? post.excerpt ?? "";
  const reading = calculateReadingTimeFromHtml(String(sourceHtml), locale);
  return {
    ...post,
    readingMinutes: reading.minutes,
    readingWords: reading.words,
    readingWordsPerMinute: reading.wordsPerMinute,
    readingText: reading.text,
  };
}

export function withReadingTimeForList<T extends ReadablePost>(
  posts: T[],
  locale?: ReadingLocale | null,
) {
  return posts.map((post) => withReadingTime(post, locale));
}

export async function getCategoryBySlug(slug: string, locale?: Locale) {
  const data = await fetchGraphQL<{ category: Term | null }>(
    GET_CATEGORY_BY_SLUG,
    { slug },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 600, tags: [CACHE_TAGS.categories, `category:${slug}`] },
    },
  );
  return data.category ?? null;
}

export async function getAllCategories({
  first,
  after,
  locale,
}: {
  first: number;
  after?: string;
  locale?: Locale;
}) {
  return fetchGraphQL<{ categories: Connection<Term> }>(
    GET_ALL_CATEGORIES,
    {
      first,
      after: after ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 600, tags: [CACHE_TAGS.categories] },
    },
  );
}

export async function getAllTags({
  first,
  after,
  locale,
}: {
  first: number;
  after?: string;
  locale?: Locale;
}) {
  const data = await fetchGraphQL<{
    tags: { nodes: Tag[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } };
  }>(
    GET_ALL_TAGS,
    { first, after: after ?? null },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 600, tags: [CACHE_TAGS.tags] },
    },
  );
  return { tags: data.tags };
}

export async function getTagBySlug(slug: string, locale?: Locale) {
  const data = await fetchGraphQL<{ tag: Tag | null }>(
    GET_TAG_BY_SLUG,
    { slug },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 600, tags: [CACHE_TAGS.tags, `tag:${slug}`] },
    },
  );
  return data.tag ?? null;
}

export async function getPostsByTagSlug(slug: string, first = 12, after?: string, locale?: Locale) {
  const targetLang = locale ? mapUiToGraphQLEnum(locale) : null;
  const data = await fetchGraphQL<{
    tag: {
      name: string;
      slug: string;
      posts: {
        nodes: PostListItem[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      };
    } | null;
  }>(
    GET_POSTS_BY_TAG_SLUG,
    { slug, first, after: after ?? null },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: {
        type: "ISR",
        revalidate: 300,
        tags: [CACHE_TAGS.posts, "posts:tag-slug", `tag:${slug}`],
      },
    },
  );

  const tag = data.tag ?? null;

  let posts = tag?.posts ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } };
  if (targetLang && posts.nodes) {
    posts = {
      ...posts,
      nodes: posts.nodes.filter((post) => post.language?.code === targetLang),
    };
  }

  posts = {
    ...posts,
    nodes: withReadingTimeForList(posts.nodes ?? [], locale ?? DEFAULT_LOCALE),
  };

  return {
    tag,
    posts,
  };
}

export async function getPostsByTagDatabaseId(
  tagDatabaseId: number,
  first = 12,
  after?: string,
  locale?: Locale,
) {
  const targetLang = locale ? mapUiToGraphQLEnum(locale) : null;
  const data = await fetchGraphQL<{
    tag: {
      name: string;
      slug: string;
      posts: {
        nodes: PostListItem[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      };
    } | null;
  }>(
    GET_POSTS_BY_TAG_DATABASE_ID,
    { tagId: String(tagDatabaseId), first, after: after ?? null },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: {
        type: "ISR",
        revalidate: 300,
        tags: [CACHE_TAGS.posts, "posts:tag-id", `tag:${tagDatabaseId}`],
      },
    },
  );

  const tag = data.tag ?? null;
  let posts = tag?.posts ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } };
  if (targetLang && posts.nodes) {
    posts = {
      ...posts,
      nodes: posts.nodes.filter((post) => post.language?.code === targetLang),
    };
  }

  posts = {
    ...posts,
    nodes: withReadingTimeForList(posts.nodes ?? [], locale ?? DEFAULT_LOCALE),
  };

  return {
    tag,
    posts,
  };
}

export async function getPostsByCategorySlug(
  slug: string,
  first = 12,
  after?: string,
  locale?: Locale,
) {
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;
  const data = await fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_POSTS_BY_CATEGORY_SLUG,
    {
      slug,
      first,
      after: after ?? null,
      language: language ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:by-category-slug"] },
    },
  );
  return {
    posts: {
      ...data.posts,
      nodes: withReadingTimeForList(data.posts?.nodes ?? [], locale ?? DEFAULT_LOCALE),
    },
  };
}

export async function getRelatedPostsByCategorySlug(params: {
  slug: string;
  first?: number;
  after?: string | null;
  locale?: Locale;
}) {
  const { slug, first = 9, after, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  const data = await fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_RELATED_POSTS_BY_CATEGORY_SLUG,
    {
      slug,
      first,
      after: after ?? null,
      language: language ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:related", "posts:category"] },
    },
  );

  return {
    posts: withReadingTimeForList(data.posts?.nodes ?? [], locale ?? DEFAULT_LOCALE),
    pageInfo: data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
}

export async function getRelatedPostsByTagSlug(params: {
  slug: string;
  first?: number;
  after?: string | null;
  locale?: Locale;
}) {
  const { slug, first = 9, after, locale } = params;
  const targetLang = locale ? mapUiToGraphQLEnum(locale) : null;

  const data = await fetchGraphQL<{
    tag: {
      posts: Connection<PostListItem>;
    } | null;
  }>(
    GET_RELATED_POSTS_BY_TAG_SLUG,
    {
      slug,
      first,
      after: after ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:related", "posts:tag"] },
    },
  );

  const nodes = data.tag?.posts?.nodes ?? [];
  const filtered = targetLang ? nodes.filter((post) => post.language?.code === targetLang) : nodes;

  return {
    posts: withReadingTimeForList(filtered, locale ?? DEFAULT_LOCALE),
    pageInfo: data.tag?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
}

export async function getLatestPostsForRelated(params: {
  first?: number;
  after?: string | null;
  locale?: Locale;
}) {
  const { first = 12, after, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  const data = await fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_RELATED_LATEST_POSTS,
    {
      first,
      after: after ?? null,
      language: language ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:related", "posts:latest"] },
    },
  );

  return {
    posts: withReadingTimeForList(data.posts?.nodes ?? [], locale ?? DEFAULT_LOCALE),
    pageInfo: data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null },
  };
}

export async function getPosts(
  first: number,
  after?: string,
): Promise<{ posts: Connection<PostListItem> }>;
export async function getPosts(opts: {
  first: number;
  after?: string;
  search?: string;
  categoryIn?: string[];
  tagIn?: string[];
  locale?: Locale;
}): Promise<{ posts: Connection<PostListItem> }>;
export async function getPosts(
  arg1:
    | number
    | {
        first: number;
        after?: string;
        search?: string;
        categoryIn?: string[];
        tagIn?: string[];
        locale?: Locale;
      },
  maybeAfter?: string,
): Promise<{ posts: Connection<PostListItem> }> {
  const first = typeof arg1 === "number" ? arg1 : arg1.first;
  const after = typeof arg1 === "number" ? maybeAfter : arg1.after;
  const locale = typeof arg1 === "number" ? undefined : arg1.locale;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  const data = await fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_POSTS,
    {
      first,
      after: after ?? null,
      categoryIn: null,
      tagIn: null,
      language: language ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:index"] },
    },
  );
  return {
    posts: {
      ...data.posts,
      nodes: withReadingTimeForList(data.posts?.nodes ?? [], locale ?? DEFAULT_LOCALE),
    },
  };
}

export async function getPostsLightweight(params: {
  first: number;
  after?: string | null;
  locale?: Locale;
}): Promise<{ posts: Connection<WPPostCard> }> {
  const { first, after, locale } = params;
  const data = await getPosts({ first, after: after ?? undefined, locale });

  return {
    posts: {
      ...data.posts,
      nodes: (data.posts?.nodes ?? []) as WPPostCard[],
    },
  };
}

export async function getPostBySlug(slug: string, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(
    GET_POST_BY_SLUG,
    { slug },
    {
      ...init,
      locale: init?.locale ?? DEFAULT_LOCALE,
      policy: init?.policy ?? { type: "ISR", revalidate: 120, tags: ["posts", "post:detail"] },
    },
  );
  const post = data.post ?? null;
  if (!post) return null;
  return withReadingTime(post, init?.locale ?? DEFAULT_LOCALE);
}

export async function getPostByUri(uri: string, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(
    GET_POST_BY_URI,
    { uri },
    {
      ...init,
      locale: init?.locale ?? DEFAULT_LOCALE,
      policy: init?.policy ?? { type: "DYNAMIC" },
    },
  );
  const post = data.post ?? null;
  if (!post) return null;
  return withReadingTime(post, init?.locale ?? DEFAULT_LOCALE);
}

export async function getPostByDatabaseId(id: number, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(
    GET_POST_BY_DATABASE_ID,
    { id },
    {
      ...init,
      locale: init?.locale ?? DEFAULT_LOCALE,
      policy: init?.policy ?? { type: "DYNAMIC" },
    },
  );
  const post = data.post ?? null;
  if (!post) return null;
  return withReadingTime(post, init?.locale ?? DEFAULT_LOCALE);
}

export async function getPostsPage(params: { first: number; after?: string | null }) {
  const { first, after } = params;
  const data = await fetchGraphQL<PostsConnectionResponse>(
    POSTS_CONNECTION,
    { first, after: after ?? null },
    {
      locale: DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:connection"] },
    },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = withReadingTimeForList(
    edges.map((e) => e.node),
    DEFAULT_LOCALE,
  );
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}

export async function getPostsPageFiltered(params: {
  first: number;
  after?: string | null;
  categoryIn?: number[] | null;
  tagIn?: number[] | null;
  locale?: Locale;
}) {
  const { first, after, categoryIn, tagIn, locale } = params;
  const categoryIds = categoryIn?.map((n) => String(n)) ?? null;
  const tagIds = tagIn?.map((n) => String(n)) ?? null;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;
  const data = await fetchGraphQL<PostsConnectionResponse>(
    POSTS_CONNECTION,
    {
      first,
      after: after ?? null,
      categoryIn: categoryIds,
      tagIn: tagIds,
      language: language ?? null,
    },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:filtered"] },
    },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = withReadingTimeForList(
    edges.map((e) => e.node),
    locale ?? DEFAULT_LOCALE,
  );
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}

export async function getPostsByCategory(params: {
  first: number;
  after?: string | null;
  locale?: Locale;
  categorySlug: string;
}) {
  const { first, after, locale, categorySlug } = params;
  const targetLang = locale ? mapUiToGraphQLEnum(locale) : null;

  const requestInit: NextInit = {
    locale: locale ?? DEFAULT_LOCALE,
    policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:category"] },
  };

  let data: {
    category?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  };

  try {
    data = await fetchGraphQL<{
      category?: {
        posts?: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: WPPostCard[];
        };
      };
    }>(GET_POSTS_BY_CATEGORY, { first, after, categorySlug }, requestInit);
  } catch (error) {
    if (!isSchemaMismatchError(error)) {
      throw error;
    }
    console.warn(
      `[wp] getPostsByCategory schema mismatch for "${categorySlug}", falling back to non-language filter.`,
      error,
    );
    const fallback = await fetchGraphQL<{
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    }>(
      GET_POSTS_BY_CATEGORY_SLUG,
      { slug: categorySlug, first, after: after ?? null, language: null },
      requestInit,
    );

    const fallbackNodes = fallback.posts?.nodes ?? [];
    const fallbackPageInfo = fallback.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    const filteredFallback = targetLang
      ? fallbackNodes.filter((post) => post.language?.code === targetLang)
      : fallbackNodes;

    return {
      posts: withReadingTimeForList(filteredFallback, locale ?? DEFAULT_LOCALE),
      pageInfo: fallbackPageInfo,
    };
  }

  const nodes = data.category?.posts?.nodes ?? [];
  const filteredNodes = targetLang
    ? nodes.filter((post) => post.language?.code === targetLang)
    : nodes;
  const pageInfo = data.category?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return {
    posts: withReadingTimeForList(filteredNodes, locale ?? DEFAULT_LOCALE),
    pageInfo,
  };
}

export async function getPostsByTag(params: {
  first: number;
  after?: string | null;
  locale?: Locale;
  tagSlug: string;
}) {
  const { first, after, locale, tagSlug } = params;
  const targetLang = locale ? mapUiToGraphQLEnum(locale) : null;

  const data = await fetchGraphQL<{
    tag?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  }>(
    GET_POSTS_BY_TAG,
    { first, after, tagSlug },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:tag"] },
    },
  );

  const nodes = data.tag?.posts?.nodes ?? [];
  const filteredNodes = targetLang
    ? nodes.filter((post) => post.language?.code === targetLang)
    : nodes;
  const pageInfo = data.tag?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return {
    posts: withReadingTimeForList(filteredNodes, locale ?? DEFAULT_LOCALE),
    pageInfo,
  };
}

export async function getPostsIndex(params: {
  first: number;
  after?: string | null;
  locale?: Locale;
}) {
  const { first, after, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  const data = await fetchGraphQL<PostsConnectionResponse>(
    GET_POSTS_INDEX,
    { first, after: after ?? null, language: language ?? null },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:index"] },
    },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = withReadingTimeForList(
    edges.map((e) => e.node),
    locale ?? DEFAULT_LOCALE,
  );
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

export async function getAllPostsByFilter(opts: {
  locale?: Locale | undefined;
  categorySlug?: string | null;
  tagSlug?: string | null;
  pageSize?: number;
  maxPages?: number;
  maxPosts?: number;
}): Promise<Array<PostListItem | WPPostCard>> {
  const { locale, categorySlug, tagSlug } = opts;
  const pageSize = opts.pageSize ?? 50;
  const maxPages = opts.maxPages ?? 50;
  const maxPosts = opts.maxPosts ?? 5000;

  let after: string | undefined;
  let page = 0;
  let hasNext = true;
  const all: Array<PostListItem | WPPostCard> = [];

  while (hasNext && page < maxPages && all.length < maxPosts) {
    if (categorySlug) {
      const res = await getPostsByCategory({ first: pageSize, after, categorySlug, locale });
      const nodes = res.posts ?? [];
      all.push(...nodes);
      const info = res.pageInfo ?? { hasNextPage: false, endCursor: null };
      hasNext = info.hasNextPage;
      after = info.endCursor ?? undefined;
    } else if (tagSlug) {
      const r = await getPostsByTag({ first: pageSize, after, tagSlug, locale });
      const nodes = r.posts ?? [];
      all.push(...nodes);
      const info = r.pageInfo ?? { hasNextPage: false, endCursor: null };
      hasNext = info.hasNextPage;
      after = info.endCursor ?? undefined;
    } else {
      const res = (await getPosts({ first: pageSize, after, locale })) as {
        posts?: {
          nodes?: PostListItem[];
          pageInfo?: { hasNextPage: boolean; endCursor: string | null };
        };
      };
      const nodes = res.posts?.nodes ?? [];
      all.push(...nodes);
      const info = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
      hasNext = info.hasNextPage;
      after = info.endCursor ?? undefined;
    }

    page++;
  }

  const map = new Map<string, PostListItem | WPPostCard>();
  for (const p of all) {
    const key = p.id ?? (p.databaseId !== undefined ? String(p.databaseId) : p.slug);
    if (!map.has(key)) map.set(key, p);
  }

  return Array.from(map.values());
}

export async function getAllPostsForCounts(locale: Locale, pageSize = 200) {
  let after: string | undefined;
  let hasNext = true;
  const all: PostListItem[] = [];

  while (hasNext) {
    const res = (await getPosts({ first: pageSize, after, locale })) as {
      posts?: {
        nodes?: PostListItem[];
        pageInfo?: { hasNextPage: boolean; endCursor: string | null };
      };
    };
    const nodes = res.posts?.nodes ?? [];
    all.push(...nodes);
    const info = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    hasNext = Boolean(info.hasNextPage);
    after = info.endCursor ?? undefined;
  }

  return all;
}

export async function getPostsPageByCategory(params: {
  first: number;
  after?: string | null;
  categorySlug: string;
  locale?: Locale;
}) {
  const { first, after, categorySlug, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;
  const res = await fetchGraphQL<{
    posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: PostListItem[] };
  }>(
    GET_POSTS_BY_CATEGORY_SLUG,
    { slug: categorySlug, first, after: after ?? null, language: language ?? null },
    {
      locale: locale ?? DEFAULT_LOCALE,
      policy: { type: "ISR", revalidate: 300, tags: ["posts", "posts:by-category-slug"] },
    },
  );

  const nodes = withReadingTimeForList(res.posts?.nodes ?? [], locale ?? DEFAULT_LOCALE);
  const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

// --- Search ---

function localeFromLanguage(language: "EN" | "RU" | "UK" | null | undefined): Locale {
  if (language === "RU") return "ru";
  if (language === "UK") return "uk";
  return DEFAULT_LOCALE;
}

export async function searchPosts({
  query,
  first = 10,
  after = null,
  language = "EN",
  locale,
}: SearchPostsArgs) {
  if (!query?.trim()) {
    return {
      posts: [] as WPPostCard[],
      pageInfo: { endCursor: null as string | null, hasNextPage: false },
    };
  }

  const data = await fetchGraphQL<{
    posts: {
      pageInfo: { endCursor: string | null; hasNextPage: boolean };
      nodes: WPPostCard[];
    };
  }>(
    SEARCH_POSTS,
    { search: query, first, after, language },
    {
      locale: locale ?? localeFromLanguage(language),
      policy: { type: "DYNAMIC" },
    },
  );

  return { posts: data.posts.nodes, pageInfo: data.posts.pageInfo };
}
