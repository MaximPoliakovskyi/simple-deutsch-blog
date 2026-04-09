import { notFound, redirect } from "next/navigation";
import PostsGridWithPagination from "@/components/posts-grid-with-pagination";
import { normalizeLevelSlug } from "@/lib/cefr";
import { buildLocalizedHref, type CefrLevelCode, type Locale, TRANSLATIONS } from "@/lib/i18n";
import {
  buildLevelTranslationMap,
  filterWordPressBadgesByLocale,
  getLocaleAwareTaxonomySlug,
  getPostsByTag,
  getTagBySlug,
} from "@/lib/posts";
import PostLanguageLinksHydrator from "./post-language-links-hydrator";

export async function LevelPageContent({ tag, locale }: { tag: string; locale: Locale }) {
  // Normalize to canonical CEFR code (e.g. "a1-ru" → "a1")
  const cefrCode = normalizeLevelSlug(tag);
  if (!cefrCode) return notFound();

  // Redirect locale-suffixed slugs to canonical route
  if (tag !== cefrCode) {
    redirect(buildLocalizedHref(locale, `/levels/${cefrCode}`));
  }

  // Look up the WordPress tag using the locale-specific slug (e.g. "a1-ru" in WP)
  const wpSlug = getLocaleAwareTaxonomySlug(cefrCode, locale);
  const term = await getTagBySlug(wpSlug, locale);
  if (!term || filterWordPressBadgesByLocale([term], locale).length === 0) {
    return notFound();
  }

  const PAGE_SIZE = 3;
  const lang: Locale = locale;
  const pageRes = await getPostsByTag({
    first: PAGE_SIZE,
    after: null,
    locale: lang,
    tagSlug: term.slug,
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
    tagSlug: term.slug,
    level: null,
  };

  const t = TRANSLATIONS[lang];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const languageLinks = buildLevelTranslationMap(term, locale);

  // Build a fully-localized level display name: e.g. "🟢 A1 (Начальный)" for RU
  const code = cefrCode.toUpperCase() as CefrLevelCode;
  const cefrTitle = t[`cefr.${code}.title`] as string | undefined;
  const emojiMatch = term.name.match(/^\p{Emoji_Presentation}/u);
  const emoji = emojiMatch ? `${emojiMatch[0]} ` : "";
  const localizedName = cefrTitle ? `${emoji}${code} (${cefrTitle})` : term.name;

  return (
    <>
      <PostLanguageLinksHydrator currentLang={locale} links={languageLinks} />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="type-display mb-6">{`${prefix} ${localizedName}`}</h1>
        {term.description ? <p>{term.description}</p> : null}

        <PostsGridWithPagination
          key={`${lang}-tag-${term.slug}`}
          initialPosts={initialPosts}
          initialPageInfo={initialPageInfo}
          pageSize={PAGE_SIZE}
          query={query}
        />
      </main>
    </>
  );
}
