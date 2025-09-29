import { fetchPostsPage } from '@/lib/wp/pagination'

export const revalidate = 0

export async function GET(req: Request) {
  const url = new URL(req.url)
  const firstParam = url.searchParams.get('first')
  const after = url.searchParams.get('after')
  const first = Number.isFinite(Number(firstParam)) ? Number(firstParam) : 3

  const page = await fetchPostsPage({ first, after })
  return Response.json({
    items: page.items,
    pageInfo: {
      hasNextPage: page.hasNextPage,
      endCursor: page.nextCursor,
    },
  })
}
