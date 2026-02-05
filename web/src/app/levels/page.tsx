// app/levels/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import {
  CEFR_LEVELS,
  CEFR_ORDER,
  CEFR_UI_CONFIG,
  getLevelDescription,
  getLevelLabel,
} from "@/core/cefr/levels";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locale";
import { getAllPostsForCounts, type PostListItem } from "@/server/wp/api";
import { mapGraphQLEnumToUi } from "@/server/wp/polylang";

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].levels} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by level.",
};

export default async function LevelsIndexPage({ locale }: { locale?: Locale } = {}) {
  const lang = locale ?? DEFAULT_LOCALE;
  const t = TRANSLATIONS[lang];
  const prefix = locale && locale !== DEFAULT_LOCALE ? `/${locale}` : "";

  const cefrOrderMap = new Map<string, number>(CEFR_ORDER.map((s, i) => [s.toLowerCase(), i]));
  const cefrLevels = [...CEFR_LEVELS].sort((a, b) => {
    const ia = cefrOrderMap.get(a.slug.toLowerCase() ?? "") ?? 999;
    const ib = cefrOrderMap.get(b.slug.toLowerCase() ?? "") ?? 999;
    return ia - ib;
  });

  type CefrSlug = "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  function getPostLanguage(post: {
    slug?: string;
    categories?: { nodes?: { slug?: string | null }[] } | null;
    language?: { code?: string | null } | null;
  }): Locale | null {
    const fromLangField = post.language?.code ? mapGraphQLEnumToUi(post.language.code) : null;
    if (fromLangField) return fromLangField;

    const catLang = post.categories?.nodes
      ?.map((c) => c?.slug)
      .find((s): s is Locale => isLocale(s));
    if (catLang) return catLang;

    const prefix = post.slug?.split("-")[0];
    if (prefix && isLocale(prefix)) return prefix;
    return null;
  }

  let allPosts: Awaited<ReturnType<typeof getAllPostsForCounts>> = [];
  try {
    allPosts = await getAllPostsForCounts(lang);
  } catch (e) {
    // During prerender the external API may be unreachable; fallback to empty list
    console.error("Failed to fetch posts for levels page during prerender:", e);
    allPosts = [];
  }

  function getPostTags(post: PostListItem): Array<{ slug?: string; name?: string }> {
    const nodes = post.tags?.nodes ?? [];
    return nodes.map((n) => ({ slug: n?.slug ?? "", name: n?.name ?? "" }));
  }

  const CEFR_SET = new Set<CefrSlug>(["a1", "a2", "b1", "b2", "c1", "c2"]);

  function isCefrSlug(value: string): value is CefrSlug {
    return CEFR_SET.has(value as CefrSlug);
  }

  function normalizeLevelSlug(slug: string): CefrSlug | null {
    if (!slug) return null;
    const s = slug.toLowerCase().trim().replace(/_/g, "-");
    const cleaned = s
      .replace(/^(?:cefrlevel-)/, "")
      .replace(/^(?:cefr-)/, "")
      .replace(/^(?:level-)/, "")
      .replace(/^(?:ger-)/, "");
    const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);
    for (const tok of tokens) {
      if (isCefrSlug(tok)) return tok;
    }
    if (/\bc2\b/.test(cleaned)) return "c2";
    if (/\bc1\b/.test(cleaned)) return "c1";
    if (/\bb2\b/.test(cleaned)) return "b2";
    if (/\bb1\b/.test(cleaned)) return "b1";
    if (/\ba2\b/.test(cleaned)) return "a2";
    if (/\ba1\b/.test(cleaned)) return "a1";
    return null;
  }

  function detectCefrLevel(tag: {
    slug?: string;
    name?: string;
  }): "a1" | "a2" | "b1" | "b2" | "c1" | "c2" | null {
    const name = (tag.name ?? "").trim().toUpperCase();
    const lower = name.toLowerCase();
    if (isCefrSlug(lower)) return lower;
    return normalizeLevelSlug(tag.slug ?? "");
  }

  const countsMap = new Map<string, number>(cefrLevels.map((l) => [l.slug, 0]));
  allPosts.forEach((post) => {
    if (getPostLanguage(post) !== lang) return;
    const levelsForPost = new Set<"a1" | "a2" | "b1" | "b2" | "c1" | "c2">();
    getPostTags(post).forEach((t) => {
      const lvl = detectCefrLevel(t);
      if (lvl) levelsForPost.add(lvl);
    });
    levelsForPost.forEach((lvl) => {
      countsMap.set(lvl, (countsMap.get(lvl) ?? 0) + 1);
    });
  });

  function formatPostCount(count: number, locale: Locale) {
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

  const getTagData = (slug: string) => {
    return {
      title: getLevelLabel(slug, lang) || slug.toUpperCase(),
      description: getLevelDescription(slug, lang) || "",
    };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-semibold">{t.levelsHeading}</h1>
      <p className="mb-8 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
        {t.levelsDescription}
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
        {cefrLevels.map((level) => {
          const tagData = getTagData(level.slug);
          const count = countsMap.get(level.slug) ?? 0;
          const code = (level.slug ?? "").toUpperCase();
          const ui = CEFR_UI_CONFIG[code] ?? { dotClass: "bg-neutral-400" };
          const titleLabel = (t[`cefr.${code}.title`] as string) ?? tagData.title;
          const longDescription =
            (t[`cefr.${code}.description`] as string) ??
            getLevelDescription(level.slug, lang) ??
            tagData.description;
          return (
            <li
              key={level.slug}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link href={`${prefix}/levels/${level.slug}`} className="group block">
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${ui.dotClass}`} />
                    <h2 className="text-lg font-medium group-hover:underline">
                      {ui.emoji ? `${ui.emoji} ${code} — ${titleLabel}` : `${code} — ${titleLabel}`}
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500">{formatPostCount(count, lang)}</span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{longDescription}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
