import type { Locale } from "@/i18n/locale";
import { fetchGraphQL } from "@/server/wp/client";
import { mapUiToGraphQLEnum } from "@/server/wp/polylang";
import {
  GET_ALL_CATEGORIES,
  GET_ALL_TAGS,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_TAG_SLUG,
  GET_TAG_BY_SLUG,
} from "@/server/wp/queries";
import type { Connection, PostListItem, Tag, Term } from "@/server/wp/types";

export async function getCategoryBySlug(slug: string) {
  const data = await fetchGraphQL<{ category: Term | null }>(GET_CATEGORY_BY_SLUG, { slug });
  return data.category ?? null;
}

export async function getAllCategories({ first, after }: { first: number; after?: string }) {
  return fetchGraphQL<{ categories: Connection<Term> }>(GET_ALL_CATEGORIES, {
    first,
    after: after ?? null,
  });
}

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

export async function getPostsByTagSlug(slug: string, first = 12, after?: string, locale?: Locale) {
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
