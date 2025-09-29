// src/lib/wp/queries.ts

// Common fragments
export const FRAGMENT_Image = /* GraphQL */ `
  fragment ImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

export const FRAGMENT_Taxonomy = /* GraphQL */ `
  fragment TaxonomyFields on TermNode {
    id
    name
    slug
  }
`;

export const FRAGMENT_PostCard = /* GraphQL */ `
  fragment PostCardFields on Post {
    id
    slug
    title
    date
    excerpt
    featuredImage {
      node {
        ...ImageFields
      }
    }
    categories {
      nodes {
        ...TaxonomyFields
      }
    }
    tags {
      nodes {
        ...TaxonomyFields
      }
    }
  }
`;

// List posts (pagination + optional search/category/tag filters)
export const QUERY_LIST_POSTS = /* GraphQL */ `
  ${FRAGMENT_Image}
  ${FRAGMENT_Taxonomy}
  ${FRAGMENT_PostCard}

  query ListPosts(
    $first: Int = 10
    $after: String
    $search: String
    $categoryIn: [ID]
    $tagIn: [ID]
  ) {
    posts(
      first: $first
      after: $after
      where: {
        search: $search
        categoryIn: $categoryIn
        tagIn: $tagIn
        orderby: { field: DATE, order: DESC }
        status: PUBLISH
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PostCardFields
      }
    }
  }
`;

// Single post by slug
export const QUERY_SINGLE_POST = /* GraphQL */ `
  ${FRAGMENT_Image}
  ${FRAGMENT_Taxonomy}

  query SinglePost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      title
      date
      content
      excerpt
      featuredImage {
        node {
          ...ImageFields
        }
      }
      categories {
        nodes {
          ...TaxonomyFields
        }
      }
      tags {
        nodes {
          ...TaxonomyFields
        }
      }
    }
  }
`;

// All categories (basic list)
export const QUERY_CATEGORIES = /* GraphQL */ `
  query AllCategories($first: Int = 100, $after: String) {
    categories(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

// All tags (basic list)
export const QUERY_TAGS = /* GraphQL */ `
  query AllTags($first: Int = 100, $after: String) {
    tags(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

// Small post list (homepage, etc.)
export const QUERY_POST_LIST = /* GraphQL */ `
  query PostList($first: Int = 12) {
    posts(first: $first) {
      nodes {
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            altText
            sourceUrl
            mediaDetails { width height }
          }
        }
      }
    }
  }
`;