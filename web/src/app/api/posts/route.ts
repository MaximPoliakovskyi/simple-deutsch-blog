import { type NextRequest, NextResponse } from "next/server";
import { tryParseLocale } from "@/lib/api-helpers";
import type { Locale } from "@/lib/i18n";
import {
  getPostBySlug,
  getPosts,
  getPostsByCategory,
  getPostsByTag,
  getPostsByTagDatabaseId,
  getPostsByTagSlug,
  getPostsIndex,
  getPostsPageByCategory,
  normalizeLevelSlug,
  type WPPostCard,
} from "@/lib/posts";

type PageInfo = { hasNextPage: boolean; endCursor: string | null };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lang = searchParams.get("lang");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const tagIdRaw = searchParams.get("tagId");
  const slug = searchParams.get("slug");
  const first = Number(searchParams.get("first")) || 200;
  const tagId = tagIdRaw ? Number(tagIdRaw) : NaN;

  // Validate locale (map legacy aliases via assertLocale)
  const validLocale: Locale | undefined = tryParseLocale(lang);

  // When filtering by language, fetch more posts to ensure we get enough after filtering
  const fetchCount = validLocale ? first * 2 : first;

  try {
    let posts: unknown[] = [];
    let pageInfo: PageInfo = {
      hasNextPage: false,
      endCursor: null,
    };

    if (slug) {
      const post = await getPostBySlug(slug, { locale: validLocale, policy: { type: "DYNAMIC" } });
      posts = post ? [post] : [];
    } else if (!Number.isNaN(tagId) && tagId > 0) {
      const res = await getPostsByTagDatabaseId(tagId, fetchCount, undefined, validLocale);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    } else if (tag) {
      const res = await getPostsByTagSlug(tag, fetchCount, undefined, validLocale);
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    } else if (category) {
      // Try with the specified locale first
      const res = await getPostsPageByCategory({
        first: fetchCount,
        categorySlug: category,
        locale: validLocale,
      });
      posts = res.posts;
      pageInfo = res.pageInfo;

      // If locale-specific fetch returned nothing but a locale was requested, try without locale filter
      if (posts.length === 0 && validLocale) {
        const fallbackRes = await getPostsPageByCategory({
          first,
          categorySlug: category,
          locale: undefined,
        });
        posts = fallbackRes.posts;
        pageInfo = fallbackRes.pageInfo;
      }
    } else if (validLocale) {
      const res = await getPosts({ first: fetchCount, locale: validLocale });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    } else {
      const res = await getPosts({ first: fetchCount });
      posts = res.posts?.nodes ?? [];
      pageInfo = res.posts?.pageInfo ?? pageInfo;
    }

    return NextResponse.json({ posts, pageInfo });
  } catch (error) {
    console.error("API posts error:", error);
    return NextResponse.json(
      { data: null, error: { code: "FETCH_ERROR", message: "Failed to fetch posts" } },
      { status: 500 },
    );
  }
}

// --- POST: load-more (paginated fetch with mode/filter support) ---

type LoadMoreBody = {
  first?: number;
  after?: string | null;
  locale?: string;
  mode?: "index" | "category" | "tag";
  categorySlug?: string | null;
  tagSlug?: string | null;
  level?: string | null;
  skipIds?: string[];
};

type PostWithTags = WPPostCard & {
  tags?: { nodes?: Array<{ slug?: string | null; name?: string | null }> | null } | null;
};

type PostsPage = { posts: WPPostCard[]; pageInfo: PageInfo };

export async function POST(req: NextRequest) {
  try {
    const {
      first = 3,
      after = null,
      locale,
      mode = "index",
      categorySlug,
      tagSlug,
      level,
      skipIds,
    }: LoadMoreBody = await req.json();

    if (!first || first <= 0) {
      return NextResponse.json({ message: "Invalid first param" }, { status: 400 });
    }

    const validLocale: Locale | undefined = tryParseLocale(locale);

    let res: PostsPage;
    if (mode === "category" && categorySlug) {
      res = await getPostsByCategory({ first, after, locale: validLocale, categorySlug });
    } else if (mode === "tag" && tagSlug) {
      res = await getPostsByTag({ first, after, locale: validLocale, tagSlug });
    } else {
      const target = level?.toLowerCase() ?? null;
      const collected: PostWithTags[] = [];
      let cursor = after ?? null;
      let hasNext = true;
      let lastPageInfo: PageInfo = { hasNextPage: false, endCursor: null };
      const pageFetchSize = Math.max(first, 10);

      while (hasNext && collected.length < first) {
        const r = await getPostsIndex({ first: pageFetchSize, after: cursor, locale: validLocale });
        const nodes: PostWithTags[] = r.posts ?? [];

        let matching = nodes;
        if (target) {
          matching = nodes.filter((p) => {
            const tagNodes = p.tags?.nodes ?? [];
            for (const t of tagNodes) {
              const m = normalizeLevelSlug(t?.slug ?? "") ?? normalizeLevelSlug(t?.name ?? "");
              if (m && m === target) return true;
            }
            return false;
          });
        }

        const seen = new Set(skipIds ?? []);
        const keyOf = (p: PostWithTags) =>
          p.id ?? (p.databaseId !== undefined ? String(p.databaseId) : (p.slug ?? ""));

        for (const m of matching) {
          if (collected.length >= first) break;
          const mk = keyOf(m);
          if (mk && seen.has(mk)) continue;
          collected.push(m);
        }

        lastPageInfo = r.pageInfo ?? { hasNextPage: false, endCursor: null };
        hasNext = Boolean(lastPageInfo.hasNextPage);
        cursor = lastPageInfo.endCursor ?? null;
      }

      return NextResponse.json({
        posts: collected,
        pageInfo: { hasNextPage: hasNext, endCursor: cursor },
      });
    }

    return NextResponse.json({ posts: res.posts, pageInfo: res.pageInfo });
  } catch (err) {
    console.error("/api/posts load-more error:", err);
    return NextResponse.json(
      { data: null, error: { code: "FETCH_ERROR", message: "Failed to load more posts" } },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
