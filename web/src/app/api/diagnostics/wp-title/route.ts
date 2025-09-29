// app/api/diagnostics/wp-title/route.ts
import { fetchGraphQL } from '@/lib/wp/client'

export const revalidate = 0 // always fresh for this diagnostic

type SiteTitleData = { generalSettings: { title: string } }

export async function GET() {
  const query = /* GraphQL */ `
    query SiteTitle {
      generalSettings {
        title
      }
    }
  `
  const data = await fetchGraphQL<SiteTitleData>(query, {}, { cache: 'no-store' })
  return Response.json({ title: data.generalSettings.title })
}
