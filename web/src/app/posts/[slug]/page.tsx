import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/wp/api";
import DOMPurify from "isomorphic-dompurify";

type Props = { params: Promise<{ slug: string }> };

// Dynamic metadata for SEO (await params in Next.js 15).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // <-- await is required in Next.js 15
  const post = await getPostBySlug(slug);

  if (!post) return { title: "Not found" };

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.metaDesc || "",
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params; // <-- await is required in Next.js 15
  const post = await getPostBySlug(slug);

  if (!post) {
    return notFound(); // official App Router 404 pattern
  }

  const safeContent = DOMPurify.sanitize(post.content);

  return (
    <main className="prose mx-auto p-4">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">
        {new Date(post.date).toLocaleDateString()} — by {post.author?.node?.name}
      </p>

      <div className="mt-6" dangerouslySetInnerHTML={{ __html: safeContent }} />

      {!!post.categories?.nodes?.length && (
        <p className="mt-6 text-sm text-gray-600">
          Categories:{" "}
          {post.categories.nodes.map((c) => (
            <span key={c.slug} className="mr-2">#{c.name}</span>
          ))}
        </p>
      )}
    </main>
  );
}

// Revalidate post pages every 10 minutes (ISR)
export const revalidate = 600;
