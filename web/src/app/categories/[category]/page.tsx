// app/categories/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import { getCategoryBySlug, getPostsByCategorySlug } from "@/lib/wp/api";

export const revalidate = 600;

type Params = { category: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params;
  const term = await getCategoryBySlug(category);
  if (!term) return { title: "Category not found" };
  return {
    title: `Category: ${term.name} — Simple Deutsch`,
    description: term.description ?? `Posts in “${term.name}”`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params;

  const term = await getCategoryBySlug(category);
  if (!term) return notFound();

  const { posts } = await getPostsByCategorySlug(category, 12);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Category: {term.name}</h1>

      {posts.nodes.length === 0 ? (
        <p className="text-gray-500">No posts in this category.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.nodes.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
