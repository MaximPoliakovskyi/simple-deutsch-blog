import { getPosts } from '@/lib/wp/api'
export const revalidate = 0
export async function GET() {
  const data = await getPosts({ first: 3 })
  return Response.json(data.posts)
}
