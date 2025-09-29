import { sanitize } from '@/lib/sanitize'
export const revalidate = 0

export async function POST(req: Request) {
  const { html } = await req.json().catch(() => ({ html: '<p>no html</p>' }))
  const safe = sanitize(html)
  return Response.json({ safe })
}
