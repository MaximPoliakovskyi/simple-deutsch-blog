// src/lib/wp/api.ts
import 'server-only'
import { fetchGraphQL } from './client'
import {
  QUERY_LIST_POSTS,
  QUERY_SINGLE_POST,
  QUERY_CATEGORIES,
  QUERY_TAGS,
} from './queries'

type PageInfo = { hasNextPage: boolean; endCursor?: string | null }
type Term = { id: string; name: string; slug: string; count?: number | null }

export type PostListItem = {
  id: string
  slug: string
  title: string
  date: string
  excerpt: string
  featuredImage?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null
  categories?: { nodes: Term[] }
  tags?: { nodes: Term[] }
}

export type PostFull = PostListItem & { content: string }

export async function getPosts(params: {
  first?: number
  after?: string
  search?: string
  categoryIn?: string[]
  tagIn?: string[]
}) {
  type Data = { posts: { pageInfo: PageInfo; nodes: PostListItem[] } }
  return fetchGraphQL<Data>(QUERY_LIST_POSTS, params, {
    next: { revalidate: 300, tags: ['posts'] }, // 5 min ISR + tag
  })
}

export async function getPostBySlug(slug: string) {
  type Data = { post: PostFull | null }
  return fetchGraphQL<Data>(QUERY_SINGLE_POST, { slug }, {
    next: { revalidate: 300, tags: [`post:${slug}`, 'posts'] },
  })
}

export async function getAllCategories(params: { first?: number; after?: string } = {}) {
  type Data = { categories: { pageInfo: PageInfo; nodes: Term[] } }
  return fetchGraphQL<Data>(QUERY_CATEGORIES, params, {
    next: { revalidate: 3600, tags: ['categories'] }, // 1h
  })
}

export async function getAllTags(params: { first?: number; after?: string } = {}) {
  type Data = { tags: { pageInfo: PageInfo; nodes: Term[] } }
  return fetchGraphQL<Data>(QUERY_TAGS, params, {
    next: { revalidate: 3600, tags: ['tags'] }, // 1h
  })
}