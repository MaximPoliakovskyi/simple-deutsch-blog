import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import { fetchGraphQL } from "@/server/wp/client";
import { SEARCH_POSTS } from "@/server/wp/queries";
import type { SearchPostsArgs, WPPostCard } from "@/server/wp/types";

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
