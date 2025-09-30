import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostContent from '@/components/PostContent';
import { getPostBySlug } from '@/lib/wp/api'; // adjust path if yours differs

// Optional: keep your ISR setting if you use it
export const revalidate = 300; // 5 minutes

// 👇 In Next 15, params is async. Type it as a Promise and ALWAYS await it.
type ParamsPromise = Promise<{ slug: string }>;

export async function generateMetadata(
  { params }: { params: ParamsPromise }
): Promise<Metadata> {
  const { slug } = await params; // ✅ must await

  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Beitrag nicht gefunden' };

  const title = post.seo?.title ?? post.title ?? 'Simple Deutsch';
  const description = post.seo?.metaDesc ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
    },
  };
}

export default async function PostPage(
  { params }: { params: ParamsPromise }
) {
  const { slug } = await params; // ✅ must await

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  // ✅ normalize null/undefined -> ''
  const safeHtml: string =
    typeof post.content === 'string' ? post.content : '';

  const title = post.title ?? 'Simple Deutsch';

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">
        {title}
      </h1>
      <PostContent html={safeHtml} />
    </main>
  );
}
