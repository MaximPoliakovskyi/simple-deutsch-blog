// src/server/wp/queries.ts
// Core GraphQL queries used by the app

export const GET_POST_BY_SLUG = /* GraphQL */ `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
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
      author {
        node {
          name
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      seo {
        title
        metaDesc
      }
    }
  }
`;

// --- Single term lookups (by slug) ---

export const GET_CATEGORY_BY_SLUG = /* GraphQL */ `
  query CategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
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
  query PostsByCategorySlug($slug: String!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $slug, orderby: { field: DATE, order: DESC }, status: PUBLISH }
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
        author {
          node {
            name
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
  query PostsFeed($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
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
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        author {
          node {
            name
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
  }
`;

// --- Cursor-based connection (edges) with categories included ---
export const POSTS_CONNECTION = /* GraphQL */ `
  query PostsConnection($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: {orderby: {field: DATE, order: DESC}}) {
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
          content
          date
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
          author {
            node {
              name
              slug
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
    }
  }
`;

// --- Search posts with categories included ---
export const SEARCH_POSTS = /* GraphQL */ `
  query SearchPosts($search: String!, $first: Int!, $after: String) {
    posts(where: { search: $search, status: PUBLISH }, first: $first, after: $after) {
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
        content
        date
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
        categories {
          nodes {
            id
            name
            slug
          }
        }
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
          content
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
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
