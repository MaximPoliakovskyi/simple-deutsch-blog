import { NextResponse } from "next/server";
import { searchPosts } from "@/server/wp/api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const after = searchParams.get("after");
  const lang = searchParams.get("lang");

  if (!q) {
    return NextResponse.json({ posts: [], pageInfo: { endCursor: null, hasNextPage: false } });
  }

  try {
    const { posts, pageInfo } = await searchPosts({ query: q, first: 8, after });

    const filtered = lang
      ? posts.filter((p: any) => p?.categories?.nodes?.some((c: any) => c?.slug === lang))
      : posts;

    const slim = filtered.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      image: p.featuredImage?.node?.sourceUrl ?? null,
    }));

    return NextResponse.json({ posts: slim, pageInfo });
  } catch (_error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
