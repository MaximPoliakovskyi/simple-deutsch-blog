// app/levels/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getCategoryBySlug, getPostsByTag, getTagBySlug } from "@/server/wp/api";
import { mapGraphQLEnumToUi } from "@/server/wp/polylang";

export const revalidate = 600;

type Params = { tag: string };
type LanguageSlug = "en" | "ru" | "uk";
type PageInfo = { endCursor: string | null; hasNextPage: boolean };

type TagNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as TagNode | null;
  if (!term) return { title: TRANSLATIONS[DEFAULT_LOCALE].levelNotFound };
  const t = TRANSLATIONS[DEFAULT_LOCALE];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? ((t[`cefr.${code}.title`] as string) ?? undefined) : undefined;
  // emoji for this level (from UI config)
  const { CEFR_UI_CONFIG } = await import("@/core/cefr/levels");
  const emoji = code ? (CEFR_UI_CONFIG[code]?.emoji ?? "") : "";
  const title =
    code && levelLabel
      ? `${prefix} ${emoji ? `${emoji} ` : ""}${code} (${levelLabel}) — ${t.siteTitle}`
      : `${prefix} ${term.name} — ${t.siteTitle}`;
  return {
    title,
    description: term.description ?? `Posts tagged with “${term.name}”`,
  };
}

export default async function LevelPage({
  params,
  locale,
}: {
  params: Promise<Params>;
  locale?: "en" | "ru" | "uk";
}) {
  const { tag } = await params;

  const term = (await getTagBySlug(tag)) as TagNode | null;
  if (!term) return notFound();
  const PAGE_SIZE = 3;

  const LANGUAGE_SLUGS: readonly LanguageSlug[] = ["en", "ru", "uk"] as const;

  function getPostLanguage(post: {
    slug?: string;
    categories?: { nodes?: { slug?: string | null }[] } | null;
    language?: { code?: string | null } | null;
  }): LanguageSlug | null {
    const fromLangField = post.language?.code ? mapGraphQLEnumToUi(post.language.code) : null;
    if (fromLangField) return fromLangField as LanguageSlug;

    const catLang = post.categories?.nodes
      ?.map((c) => c?.slug)
      .find((s) => s && (LANGUAGE_SLUGS as readonly string[]).includes(s));
    if (catLang) return catLang as LanguageSlug;

    const prefix = post.slug?.split("-")[0];
    if (prefix && (LANGUAGE_SLUGS as readonly string[]).includes(prefix))
      return prefix as LanguageSlug;
    return null;
  }

  const lang: LanguageSlug = (locale ?? "en") as LanguageSlug;

  // Build locale-specific tag slug: English uses "b1", Russian uses "b1-ru", Ukrainian uses "b1-uk"
  const localeTagSlug = lang === "en" ? tag : `${tag}-${lang}`;

  const pageRes = await getPostsByTag({
    first: PAGE_SIZE,
    after: null,
    locale: lang,
    tagSlug: localeTagSlug,
  });
  const initialPosts = pageRes.posts;
  const initialPageInfo = pageRes.pageInfo;
  const query: {
    lang: LanguageSlug;
    categorySlug: null;
    tagSlug: string | null;
    level: string | null;
  } = {
    lang,
    categorySlug: null,
    tagSlug: localeTagSlug,
    level: null,
  };

  const t = TRANSLATIONS[lang ?? DEFAULT_LOCALE];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? (t[`cefr.${code}.title`] as string) : undefined;
  const CEFR = await import("@/core/cefr/levels");
  const emoji = code ? (CEFR.CEFR_UI_CONFIG[code]?.emoji ?? "") : "";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-semibold">
        {code && levelLabel
          ? `${prefix} ${emoji ? `${emoji} ` : ""}${code} (${levelLabel})`
          : `${prefix} ${term.name}`}
      </h1>

      <PostsGridWithPagination
        key={`${lang}-tag-${tag}`}
        initialPosts={initialPosts}
        initialPageInfo={initialPageInfo}
        pageSize={PAGE_SIZE}
        query={query}
      />
    </main>
  );
}
