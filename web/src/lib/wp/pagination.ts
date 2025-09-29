import 'server-only'
import { getPosts, PostListItem } from './api'

export type Page<T> = {
  items: T[]
  nextCursor?: string | null
  hasNextPage: boolean
}

/** Fetch one page of posts and return items + nextCursor */
export async function fetchPostsPage(params: {
  first?: number
  after?: string | null
  search?: string
  categoryIn?: string[]
  tagIn?: string[]
}): Promise<Page<PostListItem>> {
  const data = await getPosts({
    first: params.first ?? 10,
    after: params.after ?? undefined,
    search: params.search,
    categoryIn: params.categoryIn,
    tagIn: params.tagIn,
  })
  const { nodes, pageInfo } = data.posts
  return {
    items: nodes,
    nextCursor: pageInfo.endCursor ?? null,
    hasNextPage: !!pageInfo.hasNextPage,
  }
}

/** Async iterator to stream all posts (be careful: can be many). */
export async function* iterateAllPosts(params: Omit<
  Parameters<typeof fetchPostsPage>[0],
  'after'
>) {
  let after: string | null | undefined = undefined
  while (true) {
    const page = await fetchPostsPage({ ...params, after })
    yield page.items
    if (!page.hasNextPage || !page.nextCursor) break
    after = page.nextCursor
  }
}