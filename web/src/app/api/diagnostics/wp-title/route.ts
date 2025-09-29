// src/app/api/diagnostics/wp-title/route.ts
import { fetchGraphQL } from '@/lib/wp/client';

export const revalidate = 0;

type SiteTitleData = { generalSettings: { title: string } };

export async function GET() {
  const query = /* GraphQL */ `
    query SiteTitle {
      generalSettings {
        title
      }
    }
  `;
  // Uncached for diagnostics
  const data = await fetchGraphQL<SiteTitleData>(query, undefined, {
    next: { revalidate: 0 },
  });
  return Response.json({ title: data.generalSettings.title });
}
