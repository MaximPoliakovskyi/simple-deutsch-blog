import { NextResponse } from "next/server";

const WP_GRAPHQL_ENDPOINT =
  process.env.WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";

// GraphQL chunks
const CATEGORY_ID_BY_SLUG = `
  query CategoryIdBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      databaseId
    }
  }
`;

const POSTS_BY_CATEGORY_IDS = `
  query PostsByCategoryIds($categoryIds: [ID]) {
    posts(where: { categoryIn: $categoryIds }) {
      nodes {
        id
        slug
        title
        excerpt
        content(format: RENDERED)
        date
        featuredImage {
          node {
            sourceUrl
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

const POSTS_DEFAULT = `
  query DefaultPosts {
    posts {
      nodes {
        id
        slug
        title
        excerpt
        content(format: RENDERED)
        date
        featuredImage {
          node {
            sourceUrl
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

async function getCategoryIdBySlug(slug: string): Promise<number | null> {
  if (!slug) return null;

  const res = await fetch(WP_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: CATEGORY_ID_BY_SLUG,
      variables: { slug },
    }),
    cache: "no-store",
  });

  const json = await res.json();
  if (json.errors) {
    console.error("CategoryIdBySlug errors:", json.errors);
    return null;
  }

  return json.data?.category?.databaseId ?? null;
}

export async function GET(req: Request) {
  if (!WP_GRAPHQL_ENDPOINT) {
    return NextResponse.json(
      { error: "WP_GRAPHQL_ENDPOINT not configured" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);

  const langSlug = searchParams.get("lang");
  const categorySlug = searchParams.get("category");

  const categoryIds = [];

  if (langSlug) {
    const id = await getCategoryIdBySlug(langSlug);
    if (id) categoryIds.push(id);
  }

  if (categorySlug) {
    const id = await getCategoryIdBySlug(categorySlug);
    if (id) categoryIds.push(id);
  }

  if (categoryIds.length > 0) {
    const postsRes = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: POSTS_BY_CATEGORY_IDS,
        variables: { categoryIds },
      }),
      cache: "no-store",
    });

    const postsJson = await postsRes.json();

    if (postsJson.errors) {
      console.error("PostsByCategoryIds errors:", postsJson.errors);
      return NextResponse.json(
        { error: "GraphQL posts error", details: postsJson.errors },
        { status: 500 }
      );
    }

    const posts: any[] = postsJson.data?.posts?.nodes ?? [];
    let filteredPosts = posts;
    if (langSlug) {
      filteredPosts = posts.filter((post: any) =>
        (post?.categories?.nodes ?? []).some((cat: any) => cat?.slug === langSlug),
      );
    }

    return NextResponse.json(filteredPosts);
  }

  const fallbackRes = await fetch(WP_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: POSTS_DEFAULT }),
    cache: "no-store",
  });

  const fallbackJson = await fallbackRes.json();

  if (fallbackJson.errors) {
    console.error("DefaultPosts errors:", fallbackJson.errors);
    return NextResponse.json(
      { error: "GraphQL default error", details: fallbackJson.errors },
      { status: 500 }
    );
  }

  const posts: any[] = fallbackJson.data?.posts?.nodes ?? [];
  let filteredPosts = posts;
  if (langSlug) {
    filteredPosts = posts.filter((post: any) =>
      (post?.categories?.nodes ?? []).some((cat: any) => cat?.slug === langSlug),
    );
  }

  return NextResponse.json(filteredPosts);
}
