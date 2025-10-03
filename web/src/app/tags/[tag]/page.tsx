// app/tags/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTagBySlug, getPostsByTagSlug } from "@/lib/wp/api";
import PostCard from "@/components/PostCard";

export const revalidate = 600;

type Params = { tag: string };

// Minimal Tag shape we use on this page
type TagNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as TagNode | null; // <- type assert
  if (!term) return { title: "Tag not found" };
  return {
    title: `Tag: ${term.name} — Simple Deutsch`,
    description: term.description ?? `Posts tagged with “${term.name}”`,
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;

  const term = (await getTagBySlug(tag)) as TagNode | null; // <- type assert
  if (!term) return notFound();

  const { posts } = await getPostsByTagSlug(tag, 12);
  const nodes = (posts as any)?.nodes ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Tag: {term.name}</h1>

      {nodes.length === 0 ? (
        <p className="text-gray-500">No posts for this tag.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((post: any) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}