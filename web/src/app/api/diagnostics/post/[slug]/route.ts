// src/app/api/diagnostics/post/[slug]/route.ts
import { getPostBySlug } from '@/lib/wp/api';

export const revalidate = 0;

type Params = { slug: string };

// Keep using async params to match your current pattern
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug); // PostDetail | null
  return Response.json(post);             // return null if not found
}
