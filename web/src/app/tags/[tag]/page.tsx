// app/tags/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { PostListItem } from "@/server/wp/api";
import { getPostsByTagSlug, getTagBySlug } from "@/server/wp/api";

export const revalidate = 600;

type Params = { tag: string };
type LanguageSlug = "en" | "ru" | "ua";
type PageInfo = { endCursor: string | null; hasNextPage: boolean };

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

export default async function TagPage({
  params,
  locale,
}: {
  params: Promise<Params>;
  locale?: "en" | "ru" | "ua";
}) {
  const { tag } = await params;

  const term = (await getTagBySlug(tag)) as TagNode | null; // <- type assert
  if (!term) return notFound();
  // PAGE_SIZE set to 3 to match categories block pagination
  const PAGE_SIZE = 3;

  // Language detection used across the site (category slug or slug prefix)
  const LANGUAGE_SLUGS: readonly LanguageSlug[] = ["en", "ru", "ua"] as const;

  function getPostLanguage(post: {
    slug?: string;
    categories?: { nodes?: { slug?: string | null }[] } | null;
  }): LanguageSlug | null {
    const catLang = post.categories?.nodes
      ?.map((c) => c?.slug)
      .find((s) => s && (LANGUAGE_SLUGS as readonly string[]).includes(s));
    if (catLang) return catLang as LanguageSlug;

    const prefix = post.slug?.split("-")[0];
    if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix))
      return prefix as LanguageSlug;
    return null;
  }

  // Determine page language
  const lang: LanguageSlug = (locale ?? "en") as LanguageSlug;

  // Fetch an initial batch and filter to current language
  const { posts: fetchedPosts }: { posts: { nodes?: PostListItem[]; pageInfo?: PageInfo } } =
    await getPostsByTagSlug(tag, PAGE_SIZE * 10);
  const nodes = (fetchedPosts?.nodes ?? []) as PostListItem[];
  const filtered = nodes.filter((p) => getPostLanguage(p) === lang);
  const initialPosts = filtered.slice(0, PAGE_SIZE) as any[];

  // Derive accurate pageInfo based on filtered posts
  const filteredHasMore = filtered.length > PAGE_SIZE;
  const upstreamPageInfo = (fetchedPosts?.pageInfo as any) ?? { hasNextPage: false, endCursor: null };
  // Only set hasNextPage when we actually have more filtered posts OR we filled the page and upstream has more
  const initialPageInfo = {
    endCursor: upstreamPageInfo.endCursor ?? null,
    hasNextPage: filteredHasMore || (filtered.length === PAGE_SIZE && upstreamPageInfo.hasNextPage) || false,
  };

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];
  const label = (t.tagLabel as string) ?? "Tag:";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{`${label} ${term.name}`}</h1>

      <PostsGridWithPagination
        key={`${lang}-tag-${tag}`}
        initialPosts={initialPosts}
        initialPageInfo={initialPageInfo}
        pageSize={PAGE_SIZE}
        query={{ lang, categorySlug: null, tagSlug: tag, level: null }}
      />
    </main>
  );
}
