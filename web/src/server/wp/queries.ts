// src/server/wp/queries.ts
// Core GraphQL queries used by the app

export const GET_POST_BY_SLUG = /* GraphQL */ `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      slug
      title
      date
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      featuredImageUrl
      author {
        node {
          name
        }
      }
      language {
        code
        slug
        locale
      }
      translations {
        databaseId
        slug
        uri
        language {
          code
          slug
          locale
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

// --- Single term lookups (by slug) ---

export const GET_CATEGORY_BY_SLUG = /* GraphQL */ `
  query CategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      uri
      count
    }
  }
`;

// --- Posts filtered by category slug ---
export const GET_POSTS_BY_CATEGORY_SLUG = /* GraphQL */ `
  query PostsByCategorySlug($slug: String!, $first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $slug, orderby: { field: DATE, order: DESC }, status: PUBLISH, language: $language }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
        language {
          code
          slug
          locale
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

// Fetch post with all translations using URI
export const GET_POST_BY_URI = /* GraphQL */ `
  query PostByUri($uri: String!) {
    post(id: $uri, idType: URI) {
      id
      databaseId
      slug
      title
      date
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      featuredImageUrl
      author {
        node {
          name
        }
      }
      language {
        code
        slug
        locale
      }
      translations {
        databaseId
        slug
        uri
        language {
          code
          slug
          locale
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

// Final fetch: fetch by databaseId to avoid slug ambiguity across languages
export const GET_POST_BY_DATABASE_ID = /* GraphQL */ `
  query PostByDatabaseId($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      slug
      title
      date
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      featuredImageUrl
      author {
        node {
          name
        }
      }
      language {
        code
        slug
        locale
      }
      translations {
        databaseId
        slug
        uri
        language {
          code
          slug
          locale
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

// --- Taxonomy collections ---
export const GET_ALL_CATEGORIES = /* GraphQL */ `
  query AllCategories($first: Int!, $after: String) {
    categories(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        description
        count
      }
    }
  }
`;

// --- Feed with categories included ---
export const GET_POSTS = /* GraphQL */ `
  query PostsFeed($first: Int!, $after: String, $categoryIn: [ID], $tagIn: [ID], $language: LanguageCodeFilterEnum) {
    posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC }, categoryIn: $categoryIn, tagIn: $tagIn, language: $language }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
        language {
          code
          slug
          locale
        }
        categories {
          nodes {
            name
            slug
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

// --- Cursor-based connection (edges) with categories included ---
export const POSTS_CONNECTION = /* GraphQL */ `
  query PostsConnection($first: Int!, $after: String, $categoryIn: [ID], $tagIn: [ID], $language: LanguageCodeFilterEnum) {
    posts(first: $first, after: $after, where: {orderby: {field: DATE, order: DESC}, categoryIn: $categoryIn, tagIn: $tagIn, language: $language}) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          slug
          title
          excerpt
          date
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              id
              databaseId
              name
              slug
            }
          }
          tags {
            nodes {
              id
              databaseId
              name
              slug
            }
          }
        }
      }
    }
  }
`;

// Explicit category-based connection (intersection-ready)
export const GET_POSTS_BY_CATEGORY = /* GraphQL */ `
  query PostsByCategory($first: Int!, $after: String, $categorySlug: ID!) {
    category(id: $categorySlug, idType: SLUG) {
      posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          slug
          title
          excerpt
          date
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              id
              databaseId
              name
              slug
            }
          }
        }
      }
    }
  }
`;

// Explicit tag-based connection (allows categoryIn + tagIn intersection)
export const GET_POSTS_BY_TAG = /* GraphQL */ `
  query PostsByTag($first: Int!, $after: String, $tagSlug: ID!) {
    tag(id: $tagSlug, idType: SLUG) {
      posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          slug
          title
          excerpt
          date
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              id
              databaseId
              name
              slug
            }
          }
        }
      }
    }
  }
`;

export const GET_POSTS_INDEX = /* GraphQL */ `
  query PostsIndex($first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
    posts(
      first: $first
      after: $after
      where: {
        orderby: { field: DATE, order: DESC }
        status: PUBLISH
        language: $language
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          slug
          title
          excerpt
          date
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              id
              databaseId
              name
              slug
            }
          }
        }
      }
    }
  }
`;

// --- Search posts with categories included ---
export const SEARCH_POSTS = /* GraphQL */ `
  query SearchPosts($search: String!, $first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
    posts(where: { search: $search, status: PUBLISH, language: $language }, first: $first, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        databaseId
        slug
        title
        excerpt
        date
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
      }
    }
  }
`;

// --- Tag queries ---

const TAG_FIELDS = /* GraphQL */ `
  fragment TagFields on Tag {
    id
    databaseId
    name
    slug
    description
    count
    uri
  }
`;

export const GET_ALL_TAGS = /* GraphQL */ `
  ${TAG_FIELDS}
  query AllTags($first: Int!, $after: String) {
    tags(first: $first, after: $after) {
      nodes {
        ...TagFields
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const GET_TAG_BY_SLUG = /* GraphQL */ `
  ${TAG_FIELDS}
  query TagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      ...TagFields
    }
  }
`;

export const GET_POSTS_BY_TAG_SLUG = /* GraphQL */ `
  query PostsByTagSlug($slug: ID!, $first: Int!, $after: String) {
    tag(id: $slug, idType: SLUG) {
      name
      slug
      posts(first: $first, after: $after) {
        nodes {
          id
          slug
          title
          date
          excerpt
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              name
              slug
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

export const GET_POSTS_BY_TAG_DATABASE_ID = /* GraphQL */ `
  query PostsByTagDatabaseId($tagId: ID!, $first: Int!, $after: String) {
    tag(id: $tagId, idType: DATABASE_ID) {
      name
      slug
      posts(first: $first, after: $after) {
        nodes {
          id
          slug
          title
          date
          excerpt
          language {
            code
            slug
            locale
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
          categories {
            nodes {
              name
              slug
            }
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
      }
    }
  }
`;

// Lightweight related-post queries (minimal fields for card rendering + reading time)
export const GET_RELATED_POSTS_BY_CATEGORY_SLUG = /* GraphQL */ `
  query RelatedPostsByCategorySlug(
    $slug: String!
    $first: Int!
    $after: String
    $language: LanguageCodeFilterEnum
  ) {
    posts(
      first: $first
      after: $after
      where: {
        categoryName: $slug
        orderby: { field: DATE, order: DESC }
        status: PUBLISH
        language: $language
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        slug
        title
        date
        excerpt
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
      }
    }
  }
`;

export const GET_RELATED_POSTS_BY_TAG_SLUG = /* GraphQL */ `
  query RelatedPostsByTagSlug($slug: ID!, $first: Int!, $after: String) {
    tag(id: $slug, idType: SLUG) {
      posts(
        first: $first
        after: $after
        where: { orderby: { field: DATE, order: DESC }, status: PUBLISH }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          databaseId
          slug
          title
          date
          excerpt
          language {
            code
            slug
            locale
          }
          categories {
            nodes {
              name
              slug
            }
          }
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          featuredImageUrl
        }
      }
    }
  }
`;

export const GET_RELATED_LATEST_POSTS = /* GraphQL */ `
  query RelatedLatestPosts($first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
    posts(
      first: $first
      after: $after
      where: { orderby: { field: DATE, order: DESC }, status: PUBLISH, language: $language }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        slug
        title
        date
        excerpt
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
      }
    }
  }
`;

// Lightweight query for homepage initial load - reduced fields for better performance
export const GET_POSTS_LIGHTWEIGHT = /* GraphQL */ `
  query PostsFeedLightweight($first: Int!, $after: String, $language: LanguageCodeFilterEnum) {
    posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC }, language: $language }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        featuredImageUrl
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;
