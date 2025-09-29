// src/app/page.tsx
import PostCard from '@/components/PostCard';
import { getPostsByCategorySlug } from '@/lib/wp/api'; // or your existing "getAllPosts"

export const revalidate = 600;

export default async function HomePage() {
  // Replace this with your existing "getAllPosts" if you have it.
  // Using a category demo to keep it compiling with our types:
  const { posts } = await getPostsByCategorySlug('news', 12);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Neueste Beiträge</h1>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.nodes.map(post => (
          <li key={post.id}>
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </main>
  );
}
