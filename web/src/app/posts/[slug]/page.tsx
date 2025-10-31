import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostContent from "@/components/PostContent";
import Link from "next/link";
import { getPostBySlug, getPostsByCategorySlug, getPostsPage } from "@/lib/wp/api"; // adjust path if yours differs
import { generateTocFromHtml } from "@/lib/utils/generateToc";

// Optional: keep your ISR setting if you use it
export const revalidate = 300; // 5 minutes

// 👇 In Next 15, params is async. Type it as a Promise and ALWAYS await it.
type ParamsPromise = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ParamsPromise }): Promise<Metadata> {
  const { slug } = await params; // ✅ must await

  const post = await getPostBySlug(slug);
  if (!post) return { title: "Beitrag nicht gefunden" };

  const title = post.seo?.title ?? post.title ?? "Simple Deutsch";
  const description = post.seo?.metaDesc ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function PostPage({ params }: { params: ParamsPromise }) {
  const { slug } = await params; // ✅ must await

  const post = await getPostBySlug(slug);
  if (!post) return notFound();

  // We render static article content for this page (screenshot example).

  // derive dynamic values
  const authorName = post.author?.node?.name ?? "Unknown author";
  const date = post.date ? new Date(post.date) : null;
  const formattedDate = date ? date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
  const firstCategory = post.categories?.nodes?.[0] ?? null;

  // compute read time (approx) from word count (200 wpm)
  const words = post.content ? post.content.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length : 0;
  const readMinutes = Math.max(1, Math.round(words / 200));

  // Generate a table-of-contents and inject anchor ids into headings
  const { html: contentHtml, toc } = post.content ? generateTocFromHtml(post.content) : { html: "", toc: [] };

  // fetch related / more posts for the sidebar
  let morePosts: { slug: string; title: string }[] = [];
  if (firstCategory?.slug) {
    const catRes = await getPostsByCategorySlug(firstCategory.slug, 6);
    const nodes = catRes.posts?.nodes ?? [];
    morePosts = nodes.filter((p) => p.slug !== post.slug).map((p) => ({ slug: p.slug, title: p.title })).slice(0, 4);
  }

  if (morePosts.length === 0) {
    const page = await getPostsPage({ first: 6 });
    morePosts = page.posts.filter((p) => p.slug !== post.slug).map((p) => ({ slug: p.slug, title: p.title })).slice(0, 4);
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <article className="md:col-span-3">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">{post.title}</h1>

          {firstCategory ? (
            <div className="mb-6">
              <Link
                href={`/categories/${firstCategory.slug}`}
                className="inline-block text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50"
              >
                {firstCategory.name}
              </Link>
            </div>
          ) : null}

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center text-white text-base font-medium">{(authorName || "").charAt(0).toUpperCase()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div className="font-medium text-gray-900 dark:text-gray-100">{authorName}</div>
              <div className="dark:text-gray-400">{formattedDate} · {readMinutes} min read</div>
            </div>
          </div>

          <div className="sd-card p-8 mb-6">
            <h3 className="font-semibold text-lg mb-3">Table of Contents:</h3>
            {toc.length ? (
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                {toc.map((t) => (
                  <li key={t.id} className={t.depth > 2 ? "pl-4" : ""}>
                    <a href={`#${t.id}`} className="hover:underline">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">No headings found in this article.</div>
            )}
          </div>

          {/* Render the post content using PostContent — content is sanitized server-side. */}
          {contentHtml ? <PostContent html={contentHtml} /> : null}
        </article>

  <aside className="md:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Promo rounded card (fill sidebar width) */}
            <div className="sd-card px-6 py-6 w-full text-center">
              <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Start your independent journey</h3>
              <div className="flex justify-center">
                <a href="#" className="inline-block rounded-full bg-neutral-900 text-white px-6 py-2 text-base">Get started</a>
              </div>
            </div>

            {/* More articles (no background/borders, fill sidebar width) */}
            <div className="px-3 py-3 rounded-xl w-full">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">More articles</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400">
                {morePosts.map((p) => (
                  <li key={p.slug} className="py-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                    <Link href={`/posts/${p.slug}`} className="hover:underline block">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
