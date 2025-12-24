// app/tags/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllPostsForCounts, type PostListItem } from "@/server/wp/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].tags} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by tag.",
};

export default async function TagsIndexPage({ locale }: { locale?: "en" | "ru" | "ua" } = {}) {
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];
  const prefix = locale && locale !== DEFAULT_LOCALE ? `/${locale}` : "";
  const lang = (locale ?? DEFAULT_LOCALE) as "en" | "ru" | "ua";

  // Define CEFR levels in order with their slugs
  const cefrLevels = [
    { slug: "a1", id: "tag-a1" },
    { slug: "a2", id: "tag-a2" },
    { slug: "b1", id: "tag-b1" },
    { slug: "b2", id: "tag-b2" },
    { slug: "c1", id: "tag-c1" },
    { slug: "c2", id: "tag-c2" },
  ];

  // Helper to detect post language (EXACT SAME as categories page)
  const LANGUAGE_SLUGS = ["en", "ru", "ua"] as const;
  type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];
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

  // Fetch the FULL dataset for counts (minimal fields), paginated
  const allPosts = await getAllPostsForCounts(lang);

  // Helper to extract tag objects (slug + name)
  function getPostTags(post: PostListItem): Array<{ slug?: string; name?: string }> {
    const nodes = post.tags?.nodes ?? [];
    return nodes.map((n) => ({ slug: n?.slug ?? "", name: n?.name ?? "" }));
  }

  // Normalize various tag slug formats to canonical CEFR levels
  function normalizeLevelSlug(slug: string): "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | null {
    if (!slug) return null;
    // Normalize case, separators
    const s = slug.toLowerCase().trim().replace(/_/g, "-");
    // Strip common prefixes at start
    let cleaned = s
      .replace(/^(?:cefrlevel-)/, "")
      .replace(/^(?:cefr-)/, "")
      .replace(/^(?:level-)/, "")
      .replace(/^(?:de-|ger-)/, "");
    // Tokenize on non-alphanumeric boundaries
    const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);
    const valid = new Set(["a1", "a2", "b1", "b2", "c1", "c2"]);
    for (const tok of tokens) {
      if (valid.has(tok)) return tok as any;
    }
    // Fallback: boundary regex checks
    if (/\bc2\b/.test(cleaned)) return "c2";
    if (/\bc1\b/.test(cleaned)) return "c1";
    if (/\bb2\b/.test(cleaned)) return "b2";
    if (/\bb1\b/.test(cleaned)) return "b1";
    if (/\ba2\b/.test(cleaned)) return "a2";
    if (/\ba1\b/.test(cleaned)) return "a1";
    return null;
  }

  // Detect CEFR level from a tag (prefer name when it is an exact CEFR code)
  function detectCefrLevel(tag: { slug?: string; name?: string }):
    | "a1"
    | "a2"
    | "b1"
    | "b2"
    | "c1"
    | "c2"
    | null {
    const name = (tag.name ?? "").trim().toUpperCase();
    const exact = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
    if (exact.has(name)) return name.toLowerCase() as any;
    return normalizeLevelSlug(tag.slug ?? "");
  }

  // Build counts map from the full posts list, respecting locale
  const countsMap = new Map<string, number>(cefrLevels.map((l) => [l.slug, 0]));
  allPosts.forEach((post) => {
    if (getPostLanguage(post) !== (lang as LanguageSlug)) return;
    const levelsForPost = new Set<"a1" | "a2" | "b1" | "b2" | "c1" | "c2">();
    getPostTags(post).forEach((t) => {
      const lvl = detectCefrLevel(t);
      if (lvl) levelsForPost.add(lvl);
    });
    levelsForPost.forEach((lvl) => countsMap.set(lvl, (countsMap.get(lvl) ?? 0) + 1));
  });

  // Helper for pluralization
  function formatPostCount(count: number, locale: "en" | "ru" | "ua") {
    if (locale === "en") {
      return `${count} ${count === 1 ? "post" : "posts"}`;
    }
    if (locale === "ru") {
      const mod10 = count % 10;
      const mod100 = count % 100;
      let word = "постов";
      if (mod10 === 1 && mod100 !== 11) word = "пост";
      else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "поста";
      return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
    }
    const mod10 = count % 10;
    const mod100 = count % 100;
    let word = "постів";
    if (mod10 === 1 && mod100 !== 11) word = "пост";
    else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "пости";
    return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
  }

  // Helper to get tag title and description by slug
  const getTagData = (slug: string) => {
    const titleKey = `${slug}Title` as keyof typeof t;
    const descKey = `${slug}Description` as keyof typeof t;
    return {
      title: t[titleKey] || slug.toUpperCase(),
      description: t[descKey] || "",
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-semibold">{t.tagsHeading}</h1>
      <p className="mb-8 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
        {t.tagsDescription}
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
        {cefrLevels.map((level) => {
          const tagData = getTagData(level.slug);
          const count = countsMap.get(level.slug) ?? 0;
          return (
            <li
              key={level.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link
                href={`${prefix}/tags/${level.slug}`}
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">
                    {tagData.title}
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {formatPostCount(count, lang)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {tagData.description}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
