// src/lib/wp/api.ts
import { fetchGraphQL } from "@/server/wp/client";
import { mapUiToGraphQLEnum } from "@/server/wp/polylang";
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
  GET_POSTS_BY_TAG_SLUG,
  GET_POSTS_INDEX,
  GET_TAG_BY_SLUG,
  POSTS_CONNECTION,
  SEARCH_POSTS,
} from "@/server/wp/queries";

type NextInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

// ---------- Shared types ----------
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
  slug: "en" | "ru" | "uk";
  locale: string;
};

export type PostTranslation = {
  databaseId: number;
  slug: string;
  uri: string;
  language: PostLanguage;
};

// For simple lists pulled from tag/category queries etc.
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
};

type Connection<TNode> = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Array<TNode>;
};

// ---------- Single terms (category) ----------
export async function getCategoryBySlug(slug: string) {
  const data = await fetchGraphQL<{ category: Term | null }>(GET_CATEGORY_BY_SLUG, { slug });
  return data.category ?? null;
}

// ---------- Posts (filtered) ----------
export async function getPostsByCategorySlug(
  slug: string,
  first = 12,
  after?: string,
  locale?: "en" | "ru" | "uk",
) {
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS_BY_CATEGORY_SLUG, {
    slug,
    first,
    after: after ?? null,
    language: language ?? null,
  });
}

// ---------- Posts (generic feed) ----------

// Overload signatures
export async function getPosts(
  first: number,
  after?: string,
): Promise<{ posts: Connection<PostListItem> }>;
export async function getPosts(opts: {
  first: number;
  after?: string;
  search?: string;
  categoryIn?: string[]; // reserved for future use
  tagIn?: string[]; // reserved for future use
  locale?: "en" | "ru" | "uk"; // language locale
}): Promise<{ posts: Connection<PostListItem> }>;

// Implementation
export async function getPosts(
  arg1:
    | number
    | {
        first: number;
        after?: string;
        search?: string;
        categoryIn?: string[];
        tagIn?: string[];
        locale?: "en" | "ru" | "uk";
      },
  maybeAfter?: string,
): Promise<{ posts: Connection<PostListItem> }> {
  const first = typeof arg1 === "number" ? arg1 : arg1.first;
  const after = typeof arg1 === "number" ? maybeAfter : arg1.after;
  const locale = typeof arg1 === "number" ? undefined : arg1.locale;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS, {
    first,
    after: after ?? null,
    categoryIn: null,
    tagIn: null,
    language: language ?? null,
  });
}

// ---------- Single post ----------
export type PostDetail = PostListItem & {
  content: string | null;
  seo?: { title?: string | null; metaDesc?: string | null } | null;
};

export async function getPostBySlug(slug: string, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(GET_POST_BY_SLUG, { slug }, init);
  return data.post ?? null;
}

export async function getPostByUri(uri: string, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(GET_POST_BY_URI, { uri }, init);
  return data.post ?? null;
}

export async function getPostByDatabaseId(id: number, init?: NextInit) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(
    GET_POST_BY_DATABASE_ID,
    { id },
    init,
  );
  return data.post ?? null;
}

// --- All categories (connection) ---
export async function getAllCategories({ first, after }: { first: number; after?: string }) {
  return fetchGraphQL<{ categories: Connection<Term> }>(GET_ALL_CATEGORIES, {
    first,
    after: after ?? null,
  });
}

// ---------- Posts (paged connection for cards/grid) ----------
export type WPPostCard = {
  id: string;
  databaseId?: number; // present on search results; optional elsewhere
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage?: { node?: WPImage | null } | null;
  featuredImageUrl?: string | null;
  author?: { node?: WPAuthor | null } | null;
  categories?: { nodes: { id?: string; name: string; slug: string }[] };
  language?: PostLanguage | null;
};

export type PostsConnectionResponse = {
  posts: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ cursor: string; node: WPPostCard }>;
  };
};

export async function getPostsPage(params: { first: number; after?: string | null }) {
  const { first, after } = params;
  const data = await fetchGraphQL<PostsConnectionResponse>(
    POSTS_CONNECTION,
    { first, after: after ?? null },
    {
      // Server-side fetch caching: tune to your needs; 5 minutes example
      next: { revalidate: 300 },
    },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}

// Fetch a single page of posts with optional numeric category/tag filters
export async function getPostsPageFiltered(params: {
  first: number;
  after?: string | null;
  categoryIn?: number[] | null;
  tagIn?: number[] | null;
  locale?: "en" | "ru" | "uk";
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
    { next: { revalidate: 300 } },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}

// Resolve numeric IDs from slugs
// Strict upstream fetch helpers using slug-based taxQuery (intersection)
export async function getPostsByCategory(params: {
  first: number;
  after?: string | null;
  locale?: "en" | "ru" | "uk";
  categorySlug: string;
}) {
  const { first, after, locale, categorySlug } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  // Note: Categories use language-specific slugs (e.g., "success-stories" vs "success-stories-ru")
  // So we don't need to filter by language - the category itself is language-specific
  const data = await fetchGraphQL<{
    category?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  }>(GET_POSTS_BY_CATEGORY, { first, after, categorySlug }, { next: { revalidate: 300 } });

  const nodes = data.category?.posts?.nodes ?? [];
  const pageInfo = data.category?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return {
    posts: nodes,
    pageInfo,
  };
}

export async function getPostsByTag(params: {
  first: number;
  after?: string | null;
  locale?: "en" | "ru" | "uk";
  tagSlug: string;
}) {
  const { first, after, locale, tagSlug } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  // Note: Tags use language-specific slugs (e.g., "b1" vs "b1-ru")
  // So we don't need to filter by language - the tag itself is language-specific
  const data = await fetchGraphQL<{
    tag?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  }>(GET_POSTS_BY_TAG, { first, after, tagSlug }, { next: { revalidate: 300 } });

  const nodes = data.tag?.posts?.nodes ?? [];
  const pageInfo = data.tag?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return {
    posts: nodes,
    pageInfo,
  };
}

export async function getPostsIndex(params: {
  first: number;
  after?: string | null;
  locale?: "en" | "ru" | "uk";
}) {
  const { first, after, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;

  const data = await fetchGraphQL<PostsConnectionResponse>(
    GET_POSTS_INDEX,
    { first, after: after ?? null, language: language ?? null },
    { next: { revalidate: 300 } },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

// Fetch all posts matching optional filters by looping upstream pagination.
export async function getAllPostsByFilter(opts: {
  locale?: "en" | "ru" | "uk" | undefined;
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

  // Deduplicate by stable key: prefer id, then databaseId, then slug
  const map = new Map<string, PostListItem | WPPostCard>();
  for (const p of all) {
    const key = p.id ?? (p.databaseId !== undefined ? String(p.databaseId) : p.slug);
    if (!map.has(key)) map.set(key, p);
  }

  return Array.from(map.values());
}

// ---------- All posts (minimal fields) for counting by locale ----------
/**
 * Fetches all published posts for the given locale language
 * in a paginated loop, returning minimal fields.
 */
export async function getAllPostsForCounts(locale: "en" | "ru" | "uk", pageSize = 200) {
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
  locale?: "en" | "ru" | "uk";
}) {
  const { first, after, categorySlug, locale } = params;
  const language = locale ? mapUiToGraphQLEnum(locale) : undefined;
  // Reuse the category-based posts query to fetch nodes (pageInfo + nodes)
  const res = await fetchGraphQL<{
    posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: PostListItem[] };
  }>(
    GET_POSTS_BY_CATEGORY_SLUG,
    { slug: categorySlug, first, after: after ?? null, language: language ?? null },
    { next: { revalidate: 300 } },
  );

  // Normalize to the same shape as getPostsPage: a flat posts array
  const nodes = res.posts?.nodes ?? [];
  const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

// ---------- Search ----------
export type SearchPostsArgs = {
  query: string;
  first?: number;
  after?: string | null;
  language?: "EN" | "RU" | "UK" | null;
};

export async function searchPosts({
  query,
  first = 10,
  after = null,
  language = "EN",
}: SearchPostsArgs) {
  if (!query?.trim()) {
    return {
      posts: [] as WPPostCard[],
      pageInfo: { endCursor: null as string | null, hasNextPage: false },
    };
  }

  // Dynamic, per-request fetch. Do not also set cache: 'no-store' to avoid conflicts.
  const data = await fetchGraphQL<{
    posts: {
      pageInfo: { endCursor: string | null; hasNextPage: boolean };
      nodes: WPPostCard[];
    };
  }>(SEARCH_POSTS, { search: query, first, after, language }, { next: { revalidate: 0 } });

  return { posts: data.posts.nodes, pageInfo: data.posts.pageInfo };
}

// ================== TAG QUERIES ==================

export async function getAllTags({ first, after }: { first: number; after?: string }) {
  const data = await fetchGraphQL<{
    tags: { nodes: Tag[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } };
  }>(GET_ALL_TAGS, { first, after: after ?? null });
  return { tags: data.tags };
}

export async function getTagBySlug(slug: string) {
  const data = await fetchGraphQL<{ tag: Tag | null }>(GET_TAG_BY_SLUG, { slug });
  return data.tag ?? null;
}

export async function getPostsByTagSlug(
  slug: string,
  first = 12,
  after?: string,
  locale?: "en" | "ru" | "uk",
) {
  const data = await fetchGraphQL<{
    tag: {
      name: string;
      slug: string;
      posts: {
        nodes: PostListItem[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      };
    } | null;
  }>(GET_POSTS_BY_TAG_SLUG, { slug, first, after: after ?? null });

  const tag = data.tag ?? null;

  // Filter posts by language if locale is provided
  let posts = tag?.posts ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } };
  if (locale && posts.nodes) {
    const targetLang = mapUiToGraphQLEnum(locale);
    posts = {
      ...posts,
      nodes: posts.nodes.filter((post) => post.language?.code === targetLang),
    };
  }

  return {
    tag,
    posts,
  };
}
