// Core GraphQL queries used by the app

export const GET_POST_BY_SLUG = /* GraphQL */ `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      slug
      title
      content
      date
      author { node { name } }
      categories { nodes { name slug } }
      seo { title metaDesc }
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
