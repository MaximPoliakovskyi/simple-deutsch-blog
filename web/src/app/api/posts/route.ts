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
  query PostsByCategoryIds($first: Int!, $categoryIds: [ID], $searchTerm: String) {
    posts(first: $first, where: { search: $searchTerm, categoryIn: $categoryIds }) {
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

const POSTS_DEFAULT = `
  query DefaultPosts($first: Int!, $searchTerm: String) {
    posts(first: $first, where: { search: $searchTerm }) {
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

const POSTS_BY_TAG_SLUG = `
  query PostsByTagSlug($first: Int!, $slug: String!, $searchTerm: String) {
    posts(first: $first, where: { tag: $slug, search: $searchTerm }) {
      nodes {
        id
        slug
        title
        excerpt
        content(format: RENDERED)
        date
        featuredImage {
          node { sourceUrl }
        }
        categories { nodes { name slug } }
        tags { nodes { name slug } }
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

  const searchTerm = searchParams.get("search") ?? null;
  const langSlug = searchParams.get("lang");
  const categorySlug = searchParams.get("category");
  const tagSlug = searchParams.get("tag");

  const categoryIds = [];
  // Only map the requested category slug to an ID here. Do NOT add the
  // language category id into the same `categoryIds` array — that would make
  // the GraphQL `categoryIn` query behave like an OR between language and
  // selected category. Instead, we'll apply the lang filter in JS after
  // fetching posts by category so the semantics are correct (category AND
  // language).
  if (categorySlug) {
    const id = await getCategoryIdBySlug(categorySlug);
    if (id) categoryIds.push(id);
  }

  // Default number of posts to request in list endpoints. Keep reasonably high
  // so locale/category/tag pages return all expected items (avoid silent truncation
  // from WP defaults). Adjust if you have a very large site.
  const FIRST = 200;

  // If a tag slug was provided, prefer tag filtering path
  if (tagSlug) {
    const postsRes = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: POSTS_BY_TAG_SLUG, variables: { first: FIRST, slug: tagSlug, searchTerm } }),
      cache: "no-store",
    });

    const postsJson = await postsRes.json();

    if (postsJson.errors) {
      console.error("PostsByTagSlug errors:", postsJson.errors);
      return NextResponse.json(
        { error: "GraphQL posts error", details: postsJson.errors },
        { status: 500 }
      );
    }

    let posts: any[] = postsJson.data?.posts?.nodes ?? [];
    // Final safety filter by language category slug when requested.
    if (langSlug) {
      posts = posts.filter((post: any) =>
        (post?.categories?.nodes ?? []).some((cat: any) => cat?.slug === langSlug),
      );
    }

    return NextResponse.json(posts);
  }

  if (categoryIds.length > 0) {
    const postsRes = await fetch(WP_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: POSTS_BY_CATEGORY_IDS,
        variables: { first: FIRST, categoryIds, searchTerm },
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
    body: JSON.stringify({ query: POSTS_DEFAULT, variables: { first: FIRST, searchTerm } }),
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
