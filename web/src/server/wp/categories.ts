import type { Locale } from "@/i18n/locale";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { CACHE_TAGS } from "@/server/cache";
import { fetchGraphQL } from "@/server/wp/client";
import { mapUiToGraphQLEnum } from "@/server/wp/polylang";
import {
  GET_ALL_CATEGORIES,
  GET_ALL_TAGS,
  GET_CATEGORY_BY_SLUG,
  GET_POSTS_BY_TAG_DATABASE_ID,
  GET_POSTS_BY_TAG_SLUG,
  GET_TAG_BY_SLUG,
} from "@/server/wp/queries";
import { withReadingTimeForList } from "@/server/wp/readingTime";
import type { Connection, PostListItem, Tag, Term } from "@/server/wp/types";

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
      policy: { type: "ISR", revalidate: 300, tags: [CACHE_TAGS.posts, "posts:tag-slug", `tag:${slug}`] },
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
      policy: { type: "ISR", revalidate: 300, tags: [CACHE_TAGS.posts, "posts:tag-id", `tag:${tagDatabaseId}`] },
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
