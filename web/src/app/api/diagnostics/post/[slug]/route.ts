// app/api/diagnostics/post/[slug]/route.ts
import { getPostBySlug } from '@/lib/wp/api'

export const revalidate = 0

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const data = await getPostBySlug(slug)
  return Response.json(data.post ?? null)
}
