import { NextResponse } from "next/server";
import { searchPosts } from "@/server/wp/api";

export const dynamic = "force-dynamic";

type PageInfo = { endCursor: string | null; hasNextPage: boolean };
type SearchPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
  categories?: { nodes?: Array<{ slug?: string | null } | null> };
};

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
      ? posts.filter((p: SearchPost) => p?.categories?.nodes?.some((c) => c?.slug === lang))
      : posts;

    const slim = filtered.map((p: SearchPost) => ({
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
