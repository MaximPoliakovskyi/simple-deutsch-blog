// app/tags/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/PostsGridWithPagination";
import type { PostListItem } from "@/lib/wp/api";
import { getPostsByTagSlug, getTagBySlug } from "@/lib/wp/api";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

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
  if (!term) return { title: TRANSLATIONS[DEFAULT_LOCALE].tagNotFound };
  return {
    title: `Tag: ${term.name} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
    description: term.description ?? `Posts tagged with “${term.name}”`,
  };
}

export default async function TagPage({ params, locale }: { params: Promise<Params>; locale?: "en" | "ru" | "ua" }) {
  const { tag } = await params;

  const term = (await getTagBySlug(tag)) as TagNode | null; // <- type assert
  if (!term) return notFound();
  // PAGE_SIZE same as posts/categories
  const PAGE_SIZE = 6;

  // Language detection used across the site (category slug or slug prefix)
  const LANGUAGE_SLUGS = ["en", "ru", "ua"] as const;
  type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];

  function getPostLanguage(post: { slug?: string; categories?: { nodes?: { slug?: string | null }[] } | null; }): LanguageSlug | null {
    const catLang = post.categories?.nodes
      ?.map((c) => c?.slug)
      .find((s) => s && (LANGUAGE_SLUGS as readonly string[]).includes(s));
    if (catLang) return catLang as LanguageSlug;

    const prefix = post.slug?.split("-")[0];
    if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix)) return prefix as LanguageSlug;
    return null;
  }

  // Determine page language
  const lang: LanguageSlug = (locale ?? "en") as LanguageSlug;

  // Fetch an initial batch and filter to current language
  const { posts: fetchedPosts } = await getPostsByTagSlug(tag, PAGE_SIZE * 2);
  const nodes = (fetchedPosts?.nodes ?? []) as PostListItem[];
  const filtered = nodes.filter((p) => getPostLanguage(p) === lang);
  const initialPosts = filtered.slice(0, PAGE_SIZE) as any[];

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];
  const label = (t.tagLabel as string) ?? "Tag:";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{`${label} ${term.name}`}</h1>

      <PostsGridWithPagination
        key={`${lang}-tag-${tag}`}
        initialPosts={initialPosts}
        initialPageInfo={(fetchedPosts?.pageInfo as any) ?? { hasNextPage: false, endCursor: null }}
        pageSize={PAGE_SIZE}
        query={{ lang, categorySlug: null, tagSlug: tag, level: null }}
      />
    </main>
  );
}
