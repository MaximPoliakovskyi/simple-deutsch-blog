// app/categories/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { translateCategory, translateCategoryDescription } from "@/core/i18n/categoryTranslations";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllCategories, getPostsPageByCategory } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

type LanguageSlug = "en" | "ru" | "ua";
type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
};

// helper removed; using shared `extractConnectionNodes` from utils

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].categories} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by category.",
};

export default async function CategoriesIndexPage({
  locale,
}: {
  locale?: "en" | "ru" | "ua";
} = {}) {
  // Your API expects one argument (e.g., { first: number })
  const { categories } = await getAllCategories({ first: 100 });

  // Support either categories.nodes or categories.edges -> node
  const nodes = extractConnectionNodes<CategoryNode>(categories);
  const visible = filterHiddenCategories(nodes);

  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];

  // derive language for counting posts per-language
  const lang = (locale ?? DEFAULT_LOCALE) as "en" | "ru" | "ua";

  // Helper to detect post language (same logic used elsewhere)
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

  // For each visible category fetch a reasonably-sized page of posts and
  // count how many match the current language. We fetch in parallel.
  // Note: this issues an extra request per category; if the site has many
  // categories we may want to optimize by fetching counts via a custom
  // GraphQL query or caching.
  const countsBySlug = await Promise.all(
    visible.map(async (c) => {
      try {
        const { posts: postsForCat } = await getPostsPageByCategory({
          first: 200,
          categorySlug: c.slug,
        });
        const count = (postsForCat ?? []).filter(
          (p) => getPostLanguage(p) === (lang as LanguageSlug),
        ).length;
        return [c.slug, count] as const;
      } catch (_err) {
        return [c.slug, 0] as const;
      }
    }),
  );
  const countsMap = new Map(countsBySlug as Array<readonly [string, number]>);

  function formatPostCount(count: number, locale: "en" | "ru" | "ua") {
    if (locale === "en") {
      return `${count} ${count === 1 ? "post" : "posts"}`;
    }
    if (locale === "ru") {
      // Russian plural rules: 1 -> пост, 2-4 -> поста, else -> постов
      const mod10 = count % 10;
      const mod100 = count % 100;
      let word = "постов";
      if (mod10 === 1 && mod100 !== 11) word = "пост";
      else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "поста";
      // Capitalize to match UI
      return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
    }
    // Ukrainian plural rules: 1 -> пост, 2-4 -> пости, else -> постів
    const mod10 = count % 10;
    const mod100 = count % 100;
    let word = "постів";
    if (mod10 === 1 && mod100 !== 11) word = "пост";
    else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "пости";
    return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-semibold">{t.categoriesHeading}</h1>
      {visible.length === 0 ? (
        <p className="text-neutral-600">{t.noCategories}</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-8">
          {visible.map((cat) => (
            <li
              key={cat.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              {/* Prefer a locale-specific description when available */}
              <Link
                href={
                  (locale ?? DEFAULT_LOCALE) === "en"
                    ? `/categories/${cat.slug}`
                    : `/${locale}/categories/${cat.slug}`
                }
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">
                    {translateCategory(cat.name, cat.slug, locale ?? "en")}
                  </h2>
                  {(() => {
                    const count = countsMap.get(cat.slug) ?? 0;
                    return (
                      <span className="text-xs text-neutral-500">
                        {formatPostCount(count, lang)}
                      </span>
                    );
                  })()}
                </div>
                {(() => {
                  const translated = translateCategoryDescription(
                    cat?.description,
                    cat?.slug,
                    locale ?? "en",
                  );
                  const final = translated ?? cat?.description ?? null;
                  if (final) {
                    return (
                      <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {final}
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm text-neutral-500">
                      Browse posts in {translateCategory(cat?.name, cat?.slug, locale ?? "en")}.
                    </p>
                  );
                })()}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
