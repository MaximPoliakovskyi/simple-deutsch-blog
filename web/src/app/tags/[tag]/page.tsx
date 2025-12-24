// app/tags/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { PostListItem } from "@/server/wp/api";
import { getTagBySlug, getCategoryBySlug, getPostsByTag } from "@/server/wp/api";

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
  // Localize title prefix and CEFR level when possible (fallback to term name)
  const t = TRANSLATIONS[DEFAULT_LOCALE];
  const prefix = (t["tag.titlePrefix"] as string) ?? (t.tagLabel as string) ?? "Tag:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? ((t[`cefr.${code}.title`] as string) ?? undefined) : undefined;
  const title = code && levelLabel ? `${prefix} ${code} (${levelLabel}) — ${t.siteTitle}` : `${prefix} ${term.name} — ${t.siteTitle}`;
  return {
    title,
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

  // Fetch first paginated page upstream using slug-based taxQuery (lang + tag)
  const pageRes = await getPostsByTag({ first: PAGE_SIZE, after: null, langSlug: lang, tagSlug: tag });
  const initialPosts = pageRes.posts as any[];
  const initialPageInfo = pageRes.pageInfo;

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];
  const prefix = (t["tag.titlePrefix"] as string) ?? (t.tagLabel as string) ?? "Tag:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? (t[`cefr.${code}.title`] as string) : undefined;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">{code && levelLabel ? `${prefix} ${code} (${levelLabel})` : `${prefix} ${term.name}`}</h1>

      <PostsGridWithPagination key={`${lang}-tag-${tag}`} initialPosts={initialPosts} initialPageInfo={initialPageInfo} pageSize={PAGE_SIZE} query={{ lang, categorySlug: null, tagSlug: tag, level: null }} />
    </main>
  );
}
