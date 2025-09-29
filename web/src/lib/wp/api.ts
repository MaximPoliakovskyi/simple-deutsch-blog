import { fetchGraphQL } from "./client";
import { GET_POST_BY_SLUG, GET_POST_LIST } from "./queries";
import type { WpPost, WpPostListItem } from "./types";

// ----- Single Post -----
type GetPostBySlugResult = { post: WpPost | null };

export async function getPostBySlug(slug: string): Promise<WpPost | null> {
  const data = await fetchGraphQL<GetPostBySlugResult>(GET_POST_BY_SLUG, { slug });
  return data.post;
}

// ----- Post List with pagination -----
type GetPostListResult = {
  posts: {
    pageInfo: { endCursor: string | null; hasNextPage: boolean };
    nodes: WpPostListItem[];
  };
};

export async function getPostList(params?: {
  first?: number;
  after?: string | null;
}): Promise<GetPostListResult["posts"]> {
  const vars = { first: params?.first ?? 10, after: params?.after ?? null };
  const data = await fetchGraphQL<GetPostListResult>(GET_POST_LIST, vars);
  return data.posts;
}
