// src/app/page.tsx
import 'server-only'
import PostCard from '@/components/PostCard'
import { getPostList } from '@/lib/wp/api' // use the lightweight list helper

export const revalidate = 300

export default async function HomePage() {
  const { posts } = await getPostList({ first: 12 })
  const items = posts.nodes

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Latest posts</h1>
      <section className="space-y-6">
        {items.map((p) => (
          <PostCard
            key={p.slug}
            slug={p.slug}
            title={p.title}
            date={p.date}
            excerpt={p.excerpt}
            image={{
              url: p.featuredImage?.node?.sourceUrl ?? undefined,
              alt: p.featuredImage?.node?.altText ?? undefined,
              width: p.featuredImage?.node?.mediaDetails?.width ?? undefined,
              height: p.featuredImage?.node?.mediaDetails?.height ?? undefined,
            }}
          />
        ))}
      </section>
    </main>
  )
}