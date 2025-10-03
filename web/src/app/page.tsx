// app/page.tsx (Server Component)
import Pagination from "@/components/Pagination";
import { getPostsPage } from "@/lib/wp/api";

export const revalidate = 300; // ISR for homepage

export default async function HomePage() {
  // First page sized for a 3-up grid
  const { posts, pageInfo } = await getPostsPage({ first: 12 });

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Render posts exactly once via Pagination (no function children) */}
      <Pagination
        initialPosts={posts}
        initialEndCursor={pageInfo?.endCursor ?? null}
        initialHasNextPage={Boolean(pageInfo?.hasNextPage)}
        pageSize={12}
      />
    </main>
  );
}