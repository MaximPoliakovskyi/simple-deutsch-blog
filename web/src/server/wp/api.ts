// src/lib/wp/api.ts
import { fetchGraphQL } from "@/server/wp/client";
import {
  GET_ALL_CATEGORIES,
  GET_ALL_TAGS,
  GET_CATEGORY_BY_SLUG,
  GET_POST_BY_SLUG,
  GET_POSTS,
  GET_POSTS_BY_CATEGORY_SLUG,
  GET_POSTS_BY_TAG_SLUG,
  GET_TAG_BY_SLUG,
  POSTS_CONNECTION,
  SEARCH_POSTS,
  GET_POSTS_BY_CATEGORY,
  GET_POSTS_BY_TAG,
  GET_POSTS_INDEX,
} from "@/server/wp/queries";

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

// For simple lists pulled from tag/category queries etc.
export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  content?: string | null;
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> };
  tags?: { nodes: Array<{ name: string; slug: string }> };
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
export async function getPostsByCategorySlug(slug: string, first = 12, after?: string) {
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS_BY_CATEGORY_SLUG, {
    slug,
    first,
    after: after ?? null,
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
  locale?: string; // language category slug (en, ru, ua)
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
        locale?: string;
      },
  maybeAfter?: string,
): Promise<{ posts: Connection<PostListItem> }> {
  const first = typeof arg1 === "number" ? arg1 : arg1.first;
  const after = typeof arg1 === "number" ? maybeAfter : arg1.after;
  const locale = typeof arg1 === "number" ? undefined : (arg1.locale as string | undefined);

  // If a locale (language category slug) is provided, use the category query
  // to filter posts by that language category. Otherwise use the generic feed.
  if (locale) {
    const res = await fetchGraphQL<{ posts: Connection<PostListItem> }>(
      GET_POSTS_BY_CATEGORY_SLUG,
      {
        slug: locale,
        first,
        after: after ?? null,
      },
    );
    return res;
  }

  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS, {
    first,
    after: after ?? null,
  });
}

// ---------- Single post ----------
export type PostDetail = PostListItem & {
  content: string | null;
  seo?: { title?: string | null; metaDesc?: string | null } | null;
  translations?: Array<{
    id?: string;
    slug?: string;
    uri?: string;
    language?: { code?: string | null } | null;
  }>;
};

export async function getPostBySlug(slug: string) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(GET_POST_BY_SLUG, { slug });
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
  author?: { node?: WPAuthor | null } | null;
  categories?: { nodes: { id?: string; name: string; slug: string }[] };
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
}) {
  const { first, after, categoryIn, tagIn } = params;
  // keep legacy POSTS_CONNECTION path when IDs are used elsewhere
  const categoryIds = categoryIn?.map((n) => String(n)) ?? null;
  const tagIds = tagIn?.map((n) => String(n)) ?? null;
  const data = await fetchGraphQL<PostsConnectionResponse>(
    POSTS_CONNECTION,
    { first, after: after ?? null, categoryIn: categoryIds, tagIn: tagIds },
    { next: { revalidate: 300 } },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}

// Resolve numeric IDs from slugs
// Strict upstream fetch helpers using slug-based taxQuery (intersection)
export async function getPostsByCategory(params: { first: number; after?: string | null; langSlug?: string | null; categorySlug: string }) {
  const { first, after, langSlug, categorySlug } = params;
  const data = await fetchGraphQL<{
    category?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  }>(
    GET_POSTS_BY_CATEGORY,
    { first, after: after ?? null, langSlug: langSlug ?? "", categorySlug },
    { next: { revalidate: 300 } },
  );

  const nodes = data.category?.posts?.nodes ?? [];
  const pageInfo = data.category?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

export async function getPostsByTag(params: { first: number; after?: string | null; langSlug?: string | null; tagSlug: string }) {
  const { first, after, langSlug, tagSlug } = params;
  const data = await fetchGraphQL<{
    tag?: {
      posts?: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: WPPostCard[] };
    };
  }>(
    GET_POSTS_BY_TAG,
    { first, after: after ?? null, langSlug: langSlug ?? "", tagSlug },
    { next: { revalidate: 300 } },
  );

  const nodes = data.tag?.posts?.nodes ?? [];
  const pageInfo = data.tag?.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

export async function getPostsIndex(params: { first: number; after?: string | null; langSlug?: string | null }) {
  const { first, after, langSlug } = params;
  const data = await fetchGraphQL<PostsConnectionResponse>(
    GET_POSTS_INDEX,
    { first, after: after ?? null, langSlug: langSlug ?? "" },
    { next: { revalidate: 300 } },
  );

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
  return { posts: nodes, pageInfo };
}

// Fetch all posts matching optional filters by looping upstream pagination.
export async function getAllPostsByFilter(opts: {
  lang?: "en" | "ru" | "ua" | string | undefined;
  categorySlug?: string | null;
  tagSlug?: string | null;
  pageSize?: number;
  maxPages?: number;
  maxPosts?: number;
}): Promise<Array<PostListItem | WPPostCard>> {
  const { lang, categorySlug, tagSlug } = opts;
  const pageSize = opts.pageSize ?? 50;
  const maxPages = opts.maxPages ?? 50;
  const maxPosts = opts.maxPosts ?? 5000;

  let after: string | undefined = undefined;
  let page = 0;
  let hasNext = true;
  const all: Array<PostListItem | WPPostCard> = [];

  const detectLang = (post: { slug?: string; categories?: { nodes?: { slug?: string | null }[] } | null }) => {
    const LANGUAGE_SLUGS = ["en", "ru", "ua"] as const;
    const catLang = post.categories?.nodes?.map((c) => c?.slug).find((s) => s && LANGUAGE_SLUGS.includes(s as any));
    if (catLang) return catLang as string;
    const prefix = post.slug?.split("-")[0];
    if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix)) return prefix;
    return null;
  };

  while (hasNext && page < maxPages && all.length < maxPosts) {
    if (categorySlug) {
      const res = await getPostsPageByCategory({ first: pageSize, after, categorySlug });
      const nodes = res.posts ?? [];
      all.push(...nodes);
      const info = res.pageInfo ?? { hasNextPage: false, endCursor: null };
      hasNext = info.hasNextPage;
      after = info.endCursor ?? undefined;
    } else if (tagSlug) {
      const r = await getPostsByTagSlug(tagSlug, pageSize, after);
      const nodes = r.posts?.nodes ?? [];
      all.push(...nodes);
      const info = r.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
      hasNext = info.hasNextPage;
      after = info.endCursor ?? undefined;
    } else {
      const res = (await getPosts({ first: pageSize, after, locale: lang })) as {
        posts?: { nodes?: PostListItem[]; pageInfo?: { hasNextPage: boolean; endCursor: string | null } };
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
    const key = (p as any).id ?? ((p as any).databaseId !== undefined ? String((p as any).databaseId) : (p as any).slug);
    if (!map.has(key)) map.set(key, p);
  }

  let result = Array.from(map.values());

  // If a language was requested but the upstream category/tag queries don't
  // support combined filters, apply language filtering on server-side.
  if (lang) {
    result = result.filter((p) => {
      const detected = detectLang(p as any);
      return detected ? detected === lang : true;
    });
  }

  return result;
}

// ---------- All posts (minimal fields) for counting by locale ----------
/**
 * Fetches all published posts for the given locale (language category slug)
 * in a paginated loop, returning minimal fields (slug, categories, tags).
 * Uses the same locale filtering logic as the regular feed.
 */
export async function getAllPostsForCounts(locale: "en" | "ru" | "ua", pageSize = 200) {
  let after: string | undefined = undefined;
  let hasNext = true;
  const all: PostListItem[] = [];

  while (hasNext) {
    const res = (await getPosts({ first: pageSize, after, locale })) as {
      posts?: { nodes?: PostListItem[]; pageInfo?: { hasNextPage: boolean; endCursor: string | null } };
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
}) {
  const { first, after, categorySlug } = params;
  // Reuse the category-based posts query to fetch nodes (pageInfo + nodes)
  const res = await fetchGraphQL<{
    posts: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: PostListItem[] };
  }>(
    GET_POSTS_BY_CATEGORY_SLUG,
    { slug: categorySlug, first, after: after ?? null },
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
};

export async function searchPosts({ query, first = 10, after = null }: SearchPostsArgs) {
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
  }>(SEARCH_POSTS, { search: query, first, after }, { next: { revalidate: 0 } });

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

export async function getPostsByTagSlug(slug: string, first = 12, after?: string) {
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
  return {
    tag,
    posts: tag?.posts ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } },
  };
}
