import type { Locale } from "@/i18n/locale";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { fetchGraphQL } from "@/server/wp/client";
import { mapUiToGraphQLEnum } from "@/server/wp/polylang";
import {
  GET_POST_BY_DATABASE_ID,
  GET_POST_BY_SLUG,
  GET_POST_BY_URI,
  GET_POSTS,
  GET_POSTS_BY_CATEGORY,
  GET_POSTS_BY_CATEGORY_SLUG,
  GET_RELATED_LATEST_POSTS,
  GET_RELATED_POSTS_BY_CATEGORY_SLUG,
  GET_RELATED_POSTS_BY_TAG_SLUG,
  GET_POSTS_BY_TAG,
  GET_POSTS_INDEX,
  POSTS_CONNECTION,
} from "@/server/wp/queries";
import { withReadingTime, withReadingTimeForList } from "@/server/wp/readingTime";
import type {
  Connection,
  NextInit,
  PostDetail,
  PostListItem,
  PostsConnectionResponse,
  WPPostCard,
} from "@/server/wp/types";

function isSchemaMismatchError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes("GraphQL errors:")) return false;
  return /not defined by type|Unknown argument|Cannot query field|Unknown type/.test(message);
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
