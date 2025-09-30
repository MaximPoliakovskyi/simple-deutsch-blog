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

export const GET_POST_LIST = /* GraphQL */ `
  query GetPostList($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo { endCursor hasNextPage }
      nodes {
        slug
        title
        excerpt
        date
        featuredImage {
          node { sourceUrl altText }
        }
      }
    }
  }
`;

// --- Single term lookups (by slug) ---
export const GET_TAG_BY_SLUG = /* GraphQL */ `
  query TagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      uri
      count
    }
  }
`;

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

// --- Posts filtered by tag slug ---
export const GET_POSTS_BY_TAG_SLUG = /* GraphQL */ `
  query PostsByTagSlug($slug: String!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      where: { tag: $slug, orderby: { field: DATE, order: DESC } }
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
      }
    }
  }
`;

// --- Posts filtered by category slug ---
export const GET_POSTS_BY_CATEGORY_SLUG = /* GraphQL */ `
  query PostsByCategorySlug($slug: String!, $first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $slug, orderby: { field: DATE, order: DESC } }
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
      }
    }
  }
`;

// src/lib/wp/queries.ts

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

export const GET_ALL_TAGS = /* GraphQL */ `
  query AllTags($first: Int!, $after: String) {
    tags(first: $first, after: $after) {
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
      }
    }
  }
`;

//

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
        }
      }
    }
  }
`;

//

// ...keep your existing exports above


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