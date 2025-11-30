import { NextRequest, NextResponse } from "next/server";
import {
  getPostsPage,
  getPostsPageByCategory,
  getPostsByTagSlug,
  getPosts,
} from "@/lib/wp/api";

type PageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

type Post = {
  id: string;
  slug: string;
  [key: string]: any;
};

// Implement WP fetch using existing helpers in lib/wp/api
async function fetchPostsFromWordPress(params: {
  first: number;
  after?: string | null;
  lang?: string;
  categorySlug?: string | null;
  tagSlug?: string | null;
  level?: string | null;
}): Promise<{ posts: Post[]; pageInfo: PageInfo }> {
  const { first, after, lang, categorySlug, tagSlug } = params;

  // Prefer tag filtering when tagSlug is provided
  if (tagSlug) {
    const res = await getPostsByTagSlug(tagSlug as string, first, (after as string) ?? undefined);
    const posts = (res.posts?.nodes ?? []) as Post[];
    const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    return { posts, pageInfo };
  }

  // Category-specific paged query (preserves pageInfo)
  if (categorySlug) {
    const { posts, pageInfo } = await getPostsPageByCategory({ first, after: after ?? undefined, categorySlug });
    return { posts: posts as Post[], pageInfo };
  }

  // Locale-aware feed
  if (lang) {
    const res = await getPosts({ first, after: after ?? undefined, locale: lang });
    const posts = res.posts?.nodes ?? [];
    const pageInfo = res.posts?.pageInfo ?? { hasNextPage: false, endCursor: null };
    return { posts: posts as Post[], pageInfo };
  }

  // Default paginated connection
  const { posts, pageInfo } = await getPostsPage({ first, after: after ?? undefined });
  return { posts: posts as Post[], pageInfo };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const first = Number(body.first ?? 0);
    const after = body.after ?? null;
    const lang = body.lang ?? undefined;
    const categorySlug = body.categorySlug ?? null;
    const tagSlug = body.tagSlug ?? null;
    const level = body.level ?? null;

    if (!first || Number.isNaN(first) || first <= 0) {
      return NextResponse.json({ message: "Invalid `first` param" }, { status: 400 });
    }

    const { posts, pageInfo } = await fetchPostsFromWordPress({ first, after, lang, categorySlug, tagSlug, level });

    return NextResponse.json({ posts, pageInfo });
  } catch (err: any) {
    console.error("/api/posts/load-more error:", err);
    const message = err?.message ?? String(err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
