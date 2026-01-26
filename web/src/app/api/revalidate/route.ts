import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CACHE_TAGS } from "@/server/cache";

type RevalidateBody = {
  type?: "posts" | "post" | "categories" | "tags";
  slug?: string;
  path?: string;
};

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token || token !== process.env.REVALIDATION_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: RevalidateBody = await req.json().catch(() => ({}) as RevalidateBody);

    switch (body.type) {
      case "posts":
        revalidateTag(CACHE_TAGS.posts, "max");
        break;
      case "post":
        if (body.slug) revalidateTag(CACHE_TAGS.post(body.slug), "max");
        break;
      case "categories":
        revalidateTag(CACHE_TAGS.categories, "max");
        break;
      case "tags":
        revalidateTag(CACHE_TAGS.tags, "max");
        break;
    }

    if (body.path) revalidatePath(body.path);

    return Response.json({ revalidated: true, now: Date.now() });
  } catch (_error) {
    return Response.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
