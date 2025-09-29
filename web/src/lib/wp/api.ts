// src/lib/wp/api.ts
import 'server-only'

import { fetchGraphQL } from './client'
import {
  QUERY_LIST_POSTS,
  QUERY_SINGLE_POST,
  QUERY_CATEGORIES,
  QUERY_TAGS,
  QUERY_POST_LIST,
} from './queries'
import { opts, REVALIDATE, CACHE_TAGS } from '../cache'

type PageInfo = { hasNextPage: boolean; endCursor?: string | null }
type Term = { id: string; name: string; slug: string; count?: number | null }

type PostImage = {
  node?: {
    sourceUrl?: string | null
    altText?: string | null
    mediaDetails?: { width?: number | null; height?: number | null } | null
  } | null
}

export type PostListItem = {
  id: string
  slug: string
  title: string
  date: string
  excerpt: string
  featuredImage?: PostImage | null
  categories?: { nodes: Term[] }
  tags?: { nodes: Term[] }
}

export type PostFull = PostListItem & { content: string }

// Filterable/paginated post list
export async function getPosts(params: {
  first?: number
  after?: string
  search?: string
  categoryIn?: string[]
  tagIn?: string[]
}) {
  type Data = { posts: { pageInfo: PageInfo; nodes: PostListItem[] } }
  return fetchGraphQL<Data>(
    QUERY_LIST_POSTS,
    params,
    opts(REVALIDATE.posts, CACHE_TAGS.posts),
  )
}

// Lightweight post list (e.g., homepage), still paginated
export async function getPostList(params: { first?: number; after?: string } = {}) {
  type Data = { posts: { pageInfo: PageInfo; nodes: PostListItem[] } }
  return fetchGraphQL<Data>(
    QUERY_POST_LIST,
    params,
    opts(REVALIDATE.posts, CACHE_TAGS.posts),
  )
}

export async function getPostBySlug(slug: string) {
  type Data = { post: PostFull | null }
  return fetchGraphQL<Data>(
    QUERY_SINGLE_POST,
    { slug },
    opts(REVALIDATE.posts, CACHE_TAGS.posts, CACHE_TAGS.post(slug)),
  )
}

export async function getAllCategories(params: { first?: number; after?: string } = {}) {
  type Data = { categories: { pageInfo: PageInfo; nodes: Term[] } }
  return fetchGraphQL<Data>(
    QUERY_CATEGORIES,
    params,
    opts(REVALIDATE.taxonomies, CACHE_TAGS.categories),
  )
}

export async function getAllTags(params: { first?: number; after?: string } = {}) {
  type Data = { tags: { pageInfo: PageInfo; nodes: Term[] } }
  return fetchGraphQL<Data>(
    QUERY_TAGS,
    params,
    opts(REVALIDATE.taxonomies, CACHE_TAGS.tags),
  )
}
