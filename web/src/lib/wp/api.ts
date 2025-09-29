// src/lib/wp/api.ts
import { fetchGraphQL } from './client';
import { POSTS_CONNECTION } from './queries';
import {
  GET_TAG_BY_SLUG,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_TAG_SLUG,
  GET_POSTS_BY_CATEGORY_SLUG,
  GET_POST_BY_SLUG,
  GET_ALL_CATEGORIES,
  GET_ALL_TAGS,
  GET_POSTS,
} from './queries';

// ---------- Shared types ----------
export type Term = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
};

export type PostListItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string | null;
  featuredImage?:
    | { node?: { sourceUrl?: string | null; altText?: string | null } | null }
    | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> };
};

type Connection<TNode> = {
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
  nodes: Array<TNode>;
};

// ---------- Single terms ----------
export async function getTagBySlug(slug: string) {
  const data = await fetchGraphQL<{ tag: Term | null }>(GET_TAG_BY_SLUG, { slug });
  return data.tag ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const data = await fetchGraphQL<{ category: Term | null }>(
    GET_CATEGORY_BY_SLUG,
    { slug }
  );
  return data.category ?? null;
}

// ---------- Posts (filtered) ----------
export async function getPostsByTagSlug(slug: string, first = 12, after?: string) {
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_POSTS_BY_TAG_SLUG,
    { slug, first, after }
  );
}

export async function getPostsByCategorySlug(
  slug: string,
  first = 12,
  after?: string
) {
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(
    GET_POSTS_BY_CATEGORY_SLUG,
    { slug, first, after }
  );
}

// ---------- Posts (generic feed) ----------

// Overload signatures
export async function getPosts(
  first: number,
  after?: string
): Promise<{ posts: Connection<PostListItem> }>;
export async function getPosts(opts: {
  first: number;
  after?: string;
  search?: string;
  categoryIn?: string[]; // reserved for future use
  tagIn?: string[];      // reserved for future use
}): Promise<{ posts: Connection<PostListItem> }>;

// Implementation
export async function getPosts(
  arg1: number | { first: number; after?: string; search?: string; categoryIn?: string[]; tagIn?: string[] },
  maybeAfter?: string
): Promise<{ posts: Connection<PostListItem> }> {
  const first = typeof arg1 === 'number' ? arg1 : arg1.first;
  const after = typeof arg1 === 'number' ? maybeAfter : arg1.after;
  // NOTE: search/categoryIn/tagIn are accepted for compatibility with callers,
  // but the current GET_POSTS query ignores them. We can wire them in later.
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS, {
    first,
    after,
  });
}

// ---------- Single post ----------
export type PostDetail = PostListItem & {
  content: string | null;
  seo?: { title?: string | null; metaDesc?: string | null } | null;
};

export async function getPostBySlug(slug: string) {
  const data = await fetchGraphQL<{ post: PostDetail | null }>(
    GET_POST_BY_SLUG,
    { slug }
  );
  return data.post ?? null;
}

// --- All categories (connection) ---
export async function getAllCategories({
  first,
  after,
}: {
  first: number;
  after?: string;
}) {
  return fetchGraphQL<{ categories: Connection<Term> }>(GET_ALL_CATEGORIES, {
    first,
    after,
  });
}

// --- All tags (connection) ---
export async function getAllTags({
  first,
  after,
}: {
  first: number;
  after?: string;
}) {
  return fetchGraphQL<{ tags: Connection<Term> }>(GET_ALL_TAGS, {
    first,
    after,
  });
}

//

export type WPImage = {
  sourceUrl: string;
  altText: string | null;
  mediaDetails?: { width?: number; height?: number } | null;
};

export type WPAuthor = { name: string; slug: string };

export type WPPostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage?: { node: WPImage } | null;
  author?: { node: WPAuthor } | null;
};

export type PostsConnectionResponse = {
  posts: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    edges: Array<{ cursor: string; node: WPPostCard }>;
  };
};

export async function getPostsPage(params: { first: number; after?: string | null }) {
  const { first, after } = params;
  const data = await fetchGraphQL<PostsConnectionResponse>(POSTS_CONNECTION, { first, after }, {
    // Server-side fetch caching: tune to your needs; 5 minutes example
    next: { revalidate: 300 },
  });

  const edges = data.posts?.edges ?? [];
  const nodes = edges.map((e) => e.node);
  const pageInfo = data.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };

  return { posts: nodes, pageInfo };
}