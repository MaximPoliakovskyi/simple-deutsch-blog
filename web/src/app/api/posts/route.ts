import { NextResponse } from "next/server";
import { getPosts, getPostsByTagSlug, getPostsPageByCategory } from "@/server/wp/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const first = Number(searchParams.get("first")) || 200;
  
  // When filtering by language, fetch more posts to ensure we get enough after filtering
  const fetchCount = lang ? first * 10 : first;

  console.log(`[API /api/posts] Request: lang="${lang}", category="${category}", tag="${tag}", first=${first}, fetchCount=${fetchCount}`);

  try {
    let posts: any[] = [];
    let pageInfo: { hasNextPage: boolean; endCursor: string | null } = {
      hasNextPage: false,
      endCursor: null,
    };

    if (tag) {
      const res = await getPostsByTagSlug(tag, fetchCount);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts from tag "${tag}"`);
    } else if (category) {
      const res = await getPostsPageByCategory({ first: fetchCount, categorySlug: category });
      posts = res.posts;
      pageInfo = res.pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts from category "${category}"`);
    } else if (lang) {
      const res = await getPosts({ first: fetchCount, locale: lang });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts for locale "${lang}"`);
    } else {
      const res = await getPosts(first);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts (no filters)`);
    }

    // Apply language filtering when lang parameter is provided
    if (lang) {
      const beforeCount = posts.length;
      posts = posts.filter((p: any) => {
        const langs = (p?.categories?.nodes ?? []).map((c: any) => c?.slug).filter((s: any) => s);
        const hasLang = langs.includes(lang);
        return hasLang;
      });
      console.log(`[API /api/posts] Filtered ${beforeCount} → ${posts.length} posts for lang="${lang}"`);
      console.log(`[API /api/posts] Sample post languages:`, posts.slice(0, 3).map((p: any) => ({
        slug: p.slug,
        langs: p?.categories?.nodes?.map((c: any) => c?.slug)
      })));
      
      // Slice to return exactly 'first' posts and update hasNextPage
      const hasMore = posts.length > first;
      posts = posts.slice(0, first);
      // Keep hasNextPage true if we either saw more filtered posts or upstream signaled more
      pageInfo.hasNextPage = hasMore || pageInfo.hasNextPage;
      
      console.log(`[API /api/posts] Returning ${posts.length} posts, hasNextPage=${pageInfo.hasNextPage}`);
    }

    return NextResponse.json({ posts, pageInfo });
  } catch (error) {
    console.error("API posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
