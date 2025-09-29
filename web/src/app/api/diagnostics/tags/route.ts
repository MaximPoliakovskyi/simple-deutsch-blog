import { getAllTags } from '@/lib/wp/api'
export const revalidate = 0
export async function GET() {
  const data = await getAllTags({ first: 10 })
  return Response.json(data.tags)
}
