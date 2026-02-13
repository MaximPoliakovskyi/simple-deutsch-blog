import Link from "next/link";
import { deduplicateCategories } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { translateCategory, translateCategoryDescription } from "@/core/i18n/categoryTranslations";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";
import { getAllCategories, getPostsPageByCategory } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
};

export async function CategoriesIndexContent({ locale }: { locale: Locale }) {
  const { categories } = await getAllCategories({ first: 100 });
  const nodes = extractConnectionNodes<CategoryNode>(categories);
  const visible = filterHiddenCategories(deduplicateCategories(nodes));
  const lang = locale;
  const t = TRANSLATIONS[lang];

  const countsBySlug = await Promise.all(
    visible.map(async (c) => {
      try {
        let { posts: postsForCat } = await getPostsPageByCategory({
          first: 200,
          categorySlug: c.slug,
          locale: lang,
        });

        if (!postsForCat || postsForCat.length === 0) {
          const { posts: postsNoLang } = await getPostsPageByCategory({
            first: 200,
            categorySlug: c.slug,
          });
          postsForCat = postsNoLang;
        }

        const count = postsForCat?.length ?? 0;
        return [c.slug, count] as const;
      } catch (_err) {
        return [c.slug, 0] as const;
      }
    }),
  );
  const countsMap = new Map(countsBySlug as Array<readonly [string, number]>);

  function formatPostCount(count: number, localeForCount: Locale) {
    if (localeForCount === "en") {
      return `${count} ${count === 1 ? "post" : "posts"}`;
    }
    if (localeForCount === "ru") {
      const mod10 = count % 10;
      const mod100 = count % 100;
      let word = "Ð¿Ð¾ÑÑ‚Ð¾Ð²";
      if (mod10 === 1 && mod100 !== 11) word = "Ð¿Ð¾ÑÑ‚";
      else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "Ð¿Ð¾ÑÑ‚Ð°";
      return `${count} ${word.charAt(0).toUpperCase() + word.slice(1)}`;
    }

    const mod10 = count % 10;
    const mod100 = count % 100;
    let word = "Ð¿Ð¾ÑÑ‚Ñ–Ð²";
    if (mod10 === 1 && mod100 !== 11) word = "Ð¿Ð¾ÑÑ‚";
    else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) word = "Ð¿Ð¾ÑÑ‚Ð¸";
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
              <Link
                href={lang === "en" ? `/categories/${cat.slug}` : `/${lang}/categories/${cat.slug}`}
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">
                    {translateCategory(cat.name, cat.slug, lang)}
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
                    lang,
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
                      Browse posts in {translateCategory(cat?.name, cat?.slug, lang)}.
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
