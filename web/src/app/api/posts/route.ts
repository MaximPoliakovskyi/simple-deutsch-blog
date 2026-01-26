import { NextResponse } from "next/server";
import { getPosts, getPostsByTagSlug, getPostsPageByCategory, getPostBySlug } from "@/server/wp/api";

type PageInfo = { hasNextPage: boolean; endCursor: string | null };

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string | null | undefined): locale is SupportedLocale | undefined =>
  locale === null || locale === undefined || SUPPORTED_LOCALES.includes(locale as SupportedLocale);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const slug = searchParams.get("slug");
  const first = Number(searchParams.get("first")) || 200;
  
  // Validate locale
  const validLocale = isSupportedLocale(lang) ? lang : undefined;

  // When filtering by language, fetch more posts to ensure we get enough after filtering
  const fetchCount = validLocale ? first * 2 : first;

  console.log(`[API /api/posts] Request: lang="${lang}", category="${category}", tag="${tag}", slug="${slug}", first=${first}, fetchCount=${fetchCount}`);

  try {
    let posts: any[] = [];
    let pageInfo: PageInfo = {
      hasNextPage: false,
      endCursor: null,
    };

    if (slug) {
      const post = await getPostBySlug(slug);
      posts = post ? [post] : [];
      console.log(`[API /api/posts] Got ${posts.length} posts for slug "${slug}"`);
    } else if (tag) {
      const res = await getPostsByTagSlug(tag, fetchCount, undefined, validLocale);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts from tag "${tag}" with locale "${lang}"`);
    } else if (category) {
      const res = await getPostsPageByCategory({ first: fetchCount, categorySlug: category, locale: validLocale });
      posts = res.posts;
      pageInfo = res.pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts from category "${category}" with locale "${lang}"`);
    } else if (validLocale) {
      const res = await getPosts({ first: fetchCount, locale: validLocale });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts for locale "${lang}"`);
    } else {
      const res = await getPosts({ first: fetchCount });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
      console.log(`[API /api/posts] Got ${posts.length} posts (no filters)`);
    }

    return NextResponse.json({ posts, pageInfo });
  } catch (error) {
    console.error("API posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
