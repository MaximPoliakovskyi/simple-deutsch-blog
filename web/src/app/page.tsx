// src/app/page.tsx
import PostCard from "@/components/PostCard";

// If you already have a fetcher, replace this with your real data call.
async function getPosts() {
  // Example shape; swap for your CMS call.
  // Must return an array where each item has: id|slug, title, image, excerpt, date, etc.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/posts`, {
    next: { revalidate: 60 }, // cache as you prefer
  });
  if (!res.ok) {
    // Fallback to empty list on error
    return [] as any[];
  }
  return (await res.json()) as any[];
}

export default async function HomePage() {
  const posts = await getPosts();

  // How many cards are truly visible above the fold on your layout?
  // If your first viewport shows 2 cards, set this to 2, etc.
  const FIRST_ROW_COUNT = 3;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      {/* Optional: a hero could go here. If you have a hero image, give it priority as well. */}
      {/* <Hero priority /> */}

      <section
        aria-label="Latest posts"
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {posts.map((post: any, i: number) => (
          <PostCard
            key={post.id ?? post.slug ?? i}
            post={post}
            // ✅ Only the first row is priority (preloaded, not lazy)
            priority={i < FIRST_ROW_COUNT}
          />
        ))}
      </section>
    </main>
  );
}
