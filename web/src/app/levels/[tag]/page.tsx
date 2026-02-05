// app/levels/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostsGridWithPagination from "@/components/features/posts/PostsGridWithPagination";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import { getPostsByTag, getTagBySlug } from "@/server/wp/api";

export const revalidate = 600;

type Params = { tag: string };

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
  locale?: Locale;
}) {
  const { tag } = await params;

  const term = (await getTagBySlug(tag)) as TagNode | null;
  if (!term) return notFound();
  const PAGE_SIZE = 3;

  const lang: Locale = locale ?? DEFAULT_LOCALE;

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
    lang: Locale;
    categorySlug: null;
    tagSlug: string | null;
    level: string | null;
  } = {
    lang,
    categorySlug: null,
    tagSlug: localeTagSlug,
    level: null,
  };

  const t = TRANSLATIONS[lang];
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
