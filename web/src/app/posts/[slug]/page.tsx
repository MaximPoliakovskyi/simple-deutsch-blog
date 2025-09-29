// src/app/posts/[slug]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/wp/api';

export const revalidate = 600;

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Beitrag nicht gefunden' };
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.metaDesc ?? undefined,
  };
}

export default async function PostPage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">{post.title}</h1>
          <div className="mt-2 text-sm text-gray-500">
            <time dateTime={post.date}>{post.date?.slice(0, 10)}</time>
            {post.author?.node?.name ? <> • {post.author.node.name}</> : null}
            {post.categories?.nodes?.length ? (
              <>
                {' • '}
                {post.categories.nodes.map((c: { name: string; slug: string }, i: number) => (
                  <span key={c.slug}>
                    {i > 0 ? ', ' : ''}
                    {c.name}
                  </span>
                ))}
              </>
            ) : null}
          </div>
        </header>

        {/* If you already sanitize elsewhere, keep it.
           Otherwise consider adding a sanitizer before rendering. */}
        <div
          className="prose max-w-none prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content ?? '' }}
        />
      </article>
    </main>
  );
}
