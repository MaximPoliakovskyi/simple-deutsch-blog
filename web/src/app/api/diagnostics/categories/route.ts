import { getAllCategories } from '@/lib/wp/api'
export const revalidate = 0
export async function GET() {
  const data = await getAllCategories({ first: 10 })
  return Response.json(data.categories)
}
