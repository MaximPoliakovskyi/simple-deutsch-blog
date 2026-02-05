import { fetchGraphQL } from "@/server/wp/client";
import { SEARCH_POSTS } from "@/server/wp/queries";
import type { SearchPostsArgs, WPPostCard } from "@/server/wp/types";

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

  const data = await fetchGraphQL<{
    posts: {
      pageInfo: { endCursor: string | null; hasNextPage: boolean };
      nodes: WPPostCard[];
    };
  }>(SEARCH_POSTS, { search: query, first, after, language }, { next: { revalidate: 0 } });

  return { posts: data.posts.nodes, pageInfo: data.posts.pageInfo };
}
