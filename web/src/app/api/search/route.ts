import { NextResponse } from "next/server";
import { searchPosts } from "@/server/wp/api";

export const dynamic = "force-dynamic";

type SearchPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  date: string;
  featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
  featuredImageUrl?: string | null;
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

  // For Russian/Ukrainian sites, don't search if query contains only Latin characters
  if (lang === "uk" || lang === "ru") {
    const hasOnlyLatinChars = /^[a-zA-Z0-9\s\-_.,!?]+$/.test(q);
    if (hasOnlyLatinChars) {
      return NextResponse.json({ posts: [], pageInfo: { endCursor: null, hasNextPage: false } });
    }
  }

  try {
    // Map UI locale to WordPress language code and search in that language only
    const wpLang = lang === "uk" ? "UK" : lang === "ru" ? "RU" : "EN";
    const { posts, pageInfo } = await searchPosts({ query: q, first: 8, after, language: wpLang });

    // WordPress already filtered by language, so just format the response
    const slim = posts.map((p: SearchPost) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      date: p.date,
      image: p.featuredImageUrl ?? p.featuredImage?.node?.sourceUrl ?? null,
    }));

    return NextResponse.json({ posts: slim, pageInfo });
  } catch (_error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
