import { type NextRequest, NextResponse } from "next/server";
import { getPostsByCategory, getPostsByTag, getPostsIndex } from "@/server/wp/api";

type PageInfo = { hasNextPage: boolean; endCursor: string | null };
type LoadMoreBody = {
  first?: number;
  after?: string | null;
  langSlug?: string; // language slug: en | ru | ua
  mode?: "index" | "category" | "tag";
  categorySlug?: string | null;
  tagSlug?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const { first = 3, after = null, langSlug, mode = "index", categorySlug, tagSlug }: LoadMoreBody =
      await req.json();

    if (!first || first <= 0) {
      return NextResponse.json({ message: "Invalid first param" }, { status: 400 });
    }

    let res;
    if (mode === "category" && categorySlug) {
      res = await getPostsByCategory({ first, after, langSlug: langSlug ?? null, categorySlug });
    } else if (mode === "tag" && tagSlug) {
      res = await getPostsByTag({ first, after, langSlug: langSlug ?? null, tagSlug });
    } else {
      res = await getPostsIndex({ first, after, langSlug: langSlug ?? null });
    }

    return NextResponse.json({ posts: res.posts, pageInfo: res.pageInfo });
  } catch (err) {
    console.error("/api/posts/load-more error:", err);
    return NextResponse.json({ error: "Failed to load more posts" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
