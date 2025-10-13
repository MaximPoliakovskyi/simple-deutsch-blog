// src/lib/wp/api.ts
import { fetchGraphQL } from "@/lib/wp/client";
import {
  GET_ALL_CATEGORIES,
  GET_CATEGORY_BY_SLUG,
  GET_POST_BY_SLUG,
  GET_POSTS,
  GET_POSTS_BY_CATEGORY_SLUG,
  POSTS_CONNECTION,
  SEARCH_POSTS,
} from "@/lib/wp/queries";

// ---------- Shared types ----------
export type Term = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
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
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  author?: { node?: { name?: string | null } | null } | null;
  categories?: { nodes: Array<{ name: string; slug: string }> };
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
}): Promise<{ posts: Connection<PostListItem> }>;

// Implementation
export async function getPosts(
  arg1:
    | number
    | { first: number; after?: string; search?: string; categoryIn?: string[]; tagIn?: string[] },
  maybeAfter?: string,
): Promise<{ posts: Connection<PostListItem> }> {
  const first = typeof arg1 === "number" ? arg1 : arg1.first;
  const after = typeof arg1 === "number" ? maybeAfter : arg1.after;
  // NOTE: search/categoryIn/tagIn are accepted for compatibility with callers,
  // but the current GET_POSTS query ignores them. We can wire them in later.
  return fetchGraphQL<{ posts: Connection<PostListItem> }>(GET_POSTS, {
    first,
    after: after ?? null,
  });
}

// ---------- Single post ----------
export type PostDetail = PostListItem & {
  content: string | null;
  seo?: { title?: string | null; metaDesc?: string | null } | null;
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

// ================== TAG QUERIES (consolidated, no duplicates) ==================

// --- TAG FIELDS FRAGMENT (local to this file) ---
const TAG_FIELDS = /* GraphQL */ `
  fragment TagFields on Tag {
    id
    databaseId
    name
    slug
    description
    count
    uri
  }
`;

// --- 1) All Tags (index page) ---
export async function getAllTags({ first, after }: { first: number; after?: string }) {
  const query = /* GraphQL */ `
    ${TAG_FIELDS}
    query AllTags($first: Int!, $after: String) {
      tags(first: $first, after: $after) {
        nodes {
          ...TagFields
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  `;
  const variables = { first, after: after ?? null };
  const data = await fetchGraphQL<{
    tags?: { nodes: unknown[]; pageInfo: { endCursor: string | null; hasNextPage: boolean } };
  }>(query, variables);
  return { tags: data?.tags ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } } };
}

// --- 2) Single Tag by slug (detail page header/meta) ---
export async function getTagBySlug(slug: string) {
  const query = /* GraphQL */ `
    ${TAG_FIELDS}
    query TagBySlug($slug: ID!) {
      tag(id: $slug, idType: SLUG) {
        ...TagFields
      }
    }
  `;
  const data = await fetchGraphQL<{ tag: unknown | null }>(query, { slug });
  return (data?.tag ?? null) as unknown;
}

// --- 3) Posts filtered by tag slug (for /tags/[tag]) ---
export async function getPostsByTagSlug(slug: string, first = 12, after?: string) {
  const query = /* GraphQL */ `
    query PostsByTagSlug($slug: ID!, $first: Int!, $after: String) {
      tag(id: $slug, idType: SLUG) {
        name
        slug
        posts(first: $first, after: $after) {
          nodes {
            id
            slug
            title
            date
            excerpt
            featuredImage {
              node {
                sourceUrl
                altText
              }
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
      }
    }
  `;
  const variables = { slug, first, after: after ?? null };
  const data = await fetchGraphQL<{
    tag?: {
      name: string;
      slug: string;
      posts?: {
        nodes: PostListItem[];
        pageInfo: { endCursor: string | null; hasNextPage: boolean };
      };
    } | null;
  }>(query, variables);

  const tag = data?.tag ?? null;
  return {
    tag,
    posts: tag?.posts ?? { nodes: [], pageInfo: { endCursor: null, hasNextPage: false } },
  };
}
