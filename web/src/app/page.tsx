import { getPostList } from "@/lib/wp/api";
import type { WpPostListItem } from "@/lib/wp/types";

export const revalidate = 300; // revalidate homepage every 5 minutes (ISR). :contentReference[oaicite:1]{index=1}

export default async function HomePage() {
  const { nodes } = await getPostList({ first: 10 });

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-6">Latest posts</h1>

      <ul className="space-y-6">
        {nodes.map((p: WpPostListItem) => (
          <li key={p.slug} className="border-b pb-4">
            <a href={`/posts/${p.slug}`} className="text-lg font-semibold hover:underline">
              {p.title}
            </a>
            <p className="text-sm text-gray-500">
              {new Date(p.date).toLocaleDateString()}
            </p>
            {p.excerpt && (
              <div
                className="prose mt-2"
                // Excerpt is HTML from WP; safe render (can additionally sanitize if desired)
                dangerouslySetInnerHTML={{ __html: p.excerpt }}
              />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
