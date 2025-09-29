// app/page.tsx
import { getPostsPage } from '@/lib/wp/api';
import Pagination from '@/components/Pagination';

export const revalidate = 300; // cache homepage briefly; client pagination hits /api

export default async function HomePage() {
  const { posts, pageInfo } = await getPostsPage({ first: 10 });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Latest posts</h1>

      <Pagination
        initialPosts={posts} // array of posts, not posts.nodes
        initialEndCursor={pageInfo.endCursor}
        initialHasNextPage={pageInfo.hasNextPage}
        pageSize={10}
      />
    </main>
  );
}
