// app/posts/page.tsx
import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/lib/wp/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Posts — Simple Deutsch",
  description: "Browse recent posts.",
};

export default async function PostsIndexPage() {
  // Your api.ts exposes getPosts (see TS hint at line 88)
  const { posts } = await getPosts({ first: 12 }); // adjust page size if you like
  const nodes = posts?.nodes ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">Posts</h1>
      {nodes.length === 0 ? (
        <p className="text-neutral-600">No posts found.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((post: any) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
