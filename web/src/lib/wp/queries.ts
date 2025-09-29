// src/lib/wp/queries.ts

// List posts (basic fields + pagination & optional search)
export const QUERY_LIST_POSTS = /* GraphQL */ `
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
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        slug
        title
        date
        excerpt
        featuredImage {
          node { sourceUrl altText }
        }
        categories { nodes { id name slug } }
        tags { nodes { id name slug } }
      }
    }
  }
`;

// Single post by slug
export const QUERY_SINGLE_POST = /* GraphQL */ `
  query SinglePost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      slug
      title
      date
      content
      excerpt
      featuredImage { node { sourceUrl altText } }
      categories { nodes { id name slug } }
      tags { nodes { id name slug } }
    }
  }
`;

// All categories (basic list)
export const QUERY_CATEGORIES = /* GraphQL */ `
  query AllCategories($first: Int = 100, $after: String) {
    categories(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id name slug count }
    }
  }
`;

// All tags (basic list)
export const QUERY_TAGS = /* GraphQL */ `
  query AllTags($first: Int = 100, $after: String) {
    tags(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { id name slug count }
    }
  }
`;
