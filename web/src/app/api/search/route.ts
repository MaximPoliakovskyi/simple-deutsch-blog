// src/app/api/search/route.ts
import { NextResponse } from "next/server";
import { searchPosts } from "@/lib/wp/api";

// Always dynamic (no cache)
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  const after = searchParams.get("after");
  const lang = searchParams.get("lang");

  if (!q) {
    return NextResponse.json(
      { posts: [], pageInfo: { endCursor: null, hasNextPage: false } },
      { status: 200 },
    );
  }

  try {
    const { posts, pageInfo } = await searchPosts({ query: q, first: 8, after });
    // If a lang filter was provided, filter posts client-side by category slug
    const filtered = lang
      ? posts.filter((post: any) => (post?.categories?.nodes ?? []).some((c: any) => c?.slug === lang))
      : posts;

    // Minimal payload for the overlay
    const slim = filtered.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      image: p.featuredImage?.node?.sourceUrl ?? null,
    }));
    return NextResponse.json(
      { posts: slim, pageInfo },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e: unknown) {
    // Narrow the unknown error to an object with message if possible
    const message = e instanceof Error ? e.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
