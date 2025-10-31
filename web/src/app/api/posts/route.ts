// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getPostsPage, getPostsByCategorySlug } from "src/lib/wp/api"; // keep this path if your tsconfig maps "@" to project root with /src; otherwise make it a relative import

const PAGE_SIZE = 10;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const after = searchParams.get("after");
    const firstParam = searchParams.get("first");
    const first = firstParam ? Math.max(1, Math.min(50, parseInt(firstParam, 10))) : PAGE_SIZE;

    if (category) {
      // Fetch posts for a specific category slug
      const data = await getPostsByCategorySlug(category, first, after ?? undefined);
      // getPostsByCategorySlug returns { posts: { nodes, pageInfo } }
      const nodes = data?.posts?.nodes ?? [];
      const pageInfo = data?.posts?.pageInfo ?? { endCursor: null, hasNextPage: false };
      return NextResponse.json({ posts: nodes, pageInfo }, { status: 200 });
    }

    const { posts, pageInfo } = await getPostsPage({ first, after });
    return NextResponse.json({ posts, pageInfo }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/posts] error:", err);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}
