import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import { getSearchPageResults, shouldSkipSearch } from "@/lib/posts";

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
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  if (shouldSkipSearch(q, locale)) {
    return NextResponse.json({ posts: [], pageInfo: { endCursor: null, hasNextPage: false } });
  }

  try {
    const { posts, pageInfo } = await getSearchPageResults({ after, first: 8, locale, query: q });

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
    return NextResponse.json(
      { data: null, error: { code: "SEARCH_ERROR", message: "Search failed" } },
      { status: 500 },
    );
  }
}
