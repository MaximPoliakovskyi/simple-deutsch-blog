import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { CACHE_TAGS } from "@/lib/cache";

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.REVALIDATION_TOKEN) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  // Supported shapes:
  // { type: 'posts' } -> revalidate posts list
  // { type: 'post', slug: 'hello-world' } -> revalidate single post
  // { type: 'categories' } or { type: 'tags' }
  // Optional: { path: '/blog' } to revalidate a route path as well

  try {
    switch (body.type) {
      case "posts":
        (revalidateTag as unknown as (...args: any[]) => void)(CACHE_TAGS.posts);
        break;
      case "post":
        if (!body.slug) throw new Error("Missing slug");
        (revalidateTag as unknown as (...args: any[]) => void)(CACHE_TAGS.post(body.slug));
        // you can also refresh the listing path if you have one:
        // revalidatePath('/blog')
        break;
      case "categories":
        (revalidateTag as unknown as (...args: any[]) => void)(CACHE_TAGS.categories);
        break;
      case "tags":
        (revalidateTag as unknown as (...args: any[]) => void)(CACHE_TAGS.tags);
        break;
      default:
        // no-op
        break;
    }
    if (body.path) revalidatePath(body.path as string);
    return Response.json({ revalidated: true, now: Date.now() });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
}
