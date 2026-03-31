import Link from "next/link";
import {
  buildLocalizedHref,
  CEFR_ORDER,
  CEFR_UI_CONFIG,
  formatLocalizedPostCount,
  getLevelDescription,
  getLevelLabel,
  isLocale,
  type Locale,
  TRANSLATIONS,
} from "@/lib/i18n";
import {
  getAllPostsForCounts,
  mapGraphQLEnumToUi,
  normalizeLevelSlug,
  type PostListItem,
} from "@/lib/posts";

export async function LevelsIndexContent({ locale }: { locale: Locale }) {
  const t = TRANSLATIONS[locale];

  function getPostLanguage(post: {
    slug?: string;
    categories?: { nodes?: { slug?: string | null }[] } | null;
    language?: { code?: string | null } | null;
  }): Locale | null {
    const fromLangField = post.language?.code ? mapGraphQLEnumToUi(post.language.code) : null;
    if (fromLangField) {
      return fromLangField;
    }

    const categoryLanguage = post.categories?.nodes
      ?.map((category) => category?.slug)
      .find((slug): slug is Locale => isLocale(slug));
    if (categoryLanguage) {
      return categoryLanguage;
    }

    const prefixFromSlug = post.slug?.split("-")[0];
    return prefixFromSlug && isLocale(prefixFromSlug) ? prefixFromSlug : null;
  }

  let allPosts: Awaited<ReturnType<typeof getAllPostsForCounts>> = [];
  try {
    allPosts = await getAllPostsForCounts(locale);
  } catch (error) {
    console.error("Failed to fetch posts for levels page during prerender:", error);
  }

  function getPostTags(post: PostListItem): Array<{ slug?: string; name?: string }> {
    return (post.tags?.nodes ?? []).map((tag) => ({
      name: tag?.name ?? "",
      slug: tag?.slug ?? "",
    }));
  }

  const countsMap = new Map<string, number>(CEFR_ORDER.map((code) => [code.toLowerCase(), 0]));
  allPosts.forEach((post) => {
    if (getPostLanguage(post) !== locale) {
      return;
    }

    const levelsForPost = new Set<string>();
    getPostTags(post).forEach((tag) => {
      const level = normalizeLevelSlug(tag.name) ?? normalizeLevelSlug(tag.slug);
      if (level) {
        levelsForPost.add(level);
      }
    });

    levelsForPost.forEach((level) => {
      countsMap.set(level, (countsMap.get(level) ?? 0) + 1);
    });
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-semibold">{t.levelsHeading}</h1>
      <p className="mb-8 max-w-2xl text-sm text-neutral-600 dark:text-neutral-300">
        {t.levelsDescription}
      </p>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {CEFR_ORDER.map((code) => {
          const slug = code.toLowerCase();
          const ui = CEFR_UI_CONFIG[code];
          const count = countsMap.get(slug) ?? 0;
          const titleLabel = (t[`cefr.${code}.title`] as string) ?? getLevelLabel(slug, locale);
          const description =
            (t[`cefr.${code}.description`] as string) ?? getLevelDescription(slug, locale) ?? "";

          return (
            <li
              key={slug}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link href={buildLocalizedHref(locale, `/levels/${slug}`)} className="group block">
                <div className="mb-1 flex items-baseline justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${ui.dotClass}`} />
                    <h2 className="text-lg font-medium group-hover:underline">
                      {ui.emoji ? `${ui.emoji} ${code} — ${titleLabel}` : `${code} — ${titleLabel}`}
                    </h2>
                  </div>
                  <span className="text-xs text-neutral-500">
                    {formatLocalizedPostCount(count, locale)}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
