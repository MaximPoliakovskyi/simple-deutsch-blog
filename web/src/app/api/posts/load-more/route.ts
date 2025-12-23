import { type NextRequest, NextResponse } from "next/server";
import { getPosts, getPostsByTagSlug, getPostsPage, getPostsPageByCategory } from "@/server/wp/api";

// Helper to detect post language from categories or slug prefix
const LANGUAGE_SLUGS = ["en", "ru", "ua"] as const;
type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type LoadMoreBody = {
  first?: number;
  after?: string | null;
  lang?: string;
  categorySlug?: string;
  tagSlug?: string;
};

function getPostLanguage(post: {
  slug?: string;
  categories?: { nodes?: { slug?: string | null }[] } | null;
}): LanguageSlug | null {
  const catLang = post.categories?.nodes
    ?.map((c) => c?.slug)
    .find((s) => s && (LANGUAGE_SLUGS as readonly string[]).includes(s));
  if (catLang) return catLang as LanguageSlug;

  const prefix = post.slug?.split("-")[0];
  if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix))
    return prefix as LanguageSlug;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { first = 0, after = null, lang, categorySlug, tagSlug }: LoadMoreBody =
      await req.json();

    if (!first || first <= 0) {
      return NextResponse.json({ message: "Invalid first param" }, { status: 400 });
    }
    
    // When filtering by language, fetch more posts to ensure we get enough after filtering
    const fetchCount = lang ? first * 10 : first;

    let posts: any[] = [];
    let pageInfo: PageInfo = {
      hasNextPage: false,
      endCursor: null,
    };

    if (tagSlug) {
      const res = await getPostsByTagSlug(tagSlug, fetchCount, after ?? undefined);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    } else if (categorySlug) {
      const res = await getPostsPageByCategory({ first: fetchCount, after: after ?? undefined, categorySlug });
      posts = res.posts;
      pageInfo = res.pageInfo;
    } else if (lang) {
      const res = await getPosts({ first, after: after ?? undefined, locale: lang });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    } else {
      const res = await getPostsPage({ first, after: after ?? undefined });
      posts = res.posts;
      pageInfo = res.pageInfo;
    }

    // Apply client-side language filtering whenever lang is provided
    if (lang) {
      const beforeCount = posts.length;
      posts = posts.filter((p: any) => getPostLanguage(p) === lang);
      console.log(`[API load-more] Filtered ${beforeCount} → ${posts.length} posts for lang="${lang}"`);
      
      // Slice to return exactly 'first' posts and update hasNextPage
      const hasMore = posts.length > first;
      posts = posts.slice(0, first);
      pageInfo.hasNextPage = hasMore || pageInfo.hasNextPage;
    }

    return NextResponse.json({ posts, pageInfo });
  } catch (err: any) {
    console.error("load-more error:", err);
    return NextResponse.json({ message: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
