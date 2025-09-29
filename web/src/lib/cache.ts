// src/lib/cache.ts
export const CACHE_TAGS = {
  posts: 'posts',
  post: (slug: string) => `post:${slug}`,
  categories: 'categories',
  tags: 'tags',
} as const

export const REVALIDATE = {
  posts: 300,       // 5 minutes
  taxonomies: 3600, // 1 hour
} as const

export type CacheOpts = {
  revalidate?: number
  tags?: string[]
}

export function opts(revalidate: number, ...tags: string[]): { next: CacheOpts } {
  return { next: { revalidate, tags } }
}