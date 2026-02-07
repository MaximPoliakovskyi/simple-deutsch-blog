import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import PostContent from "@/components/features/posts/PostContent";
import PostLanguageLinksHydrator from "@/components/features/posts/PostLanguageLinksHydrator";
import { generateTocFromHtml } from "@/core/content/generateToc";
import { isHiddenCategory } from "@/core/content/hiddenCategories";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locale";
import type { LocaleTranslationMap } from "@/i18n/pathMapping";
import { buildI18nAlternates } from "@/i18n/seo";
import type { PostDetail } from "@/server/wp/api";
import { getPostBySlug, getPostsPageFiltered } from "@/server/wp/api"; // adjust path if yours differs
import { mapGraphQLEnumToUi } from "@/server/wp/polylang";

type LanguageSlug = Locale;

function getPostLanguageFromGraphQL(post: PostDetail | null): LanguageSlug | null {
  if (!post?.language?.code) return null;
  return mapGraphQLEnumToUi(post.language.code);
}

const buildLocalizedPostPath = (lang: LanguageSlug, slugValue?: string | null) => {
  if (!slugValue) return null;
  const cleanSlug = slugValue.replace(/^\/+/g, "").replace(/\/+$/g, "");
  // Always return canonical, prefixed routes (avoids middleware redirects like /posts/* -> /en/posts/*).
  return `/${lang}/posts/${cleanSlug}`;
};

function buildPostTranslationMap(
  post: PostDetail,
  currentLocale: LanguageSlug,
): Record<LanguageSlug, string | null> {
  const links: Record<LanguageSlug, string | null> = { en: null, ru: null, uk: null };

  if (post.translations && Array.isArray(post.translations)) {
    post.translations.forEach((translation) => {
      const uiLang = mapGraphQLEnumToUi(translation.language?.code);
      if (!uiLang) return;

      const pathFromSlug = buildLocalizedPostPath(uiLang, translation.slug);
      if (pathFromSlug) {
        links[uiLang] = pathFromSlug;
        return;
      }

      if (translation.uri) {
        try {
          const parsed = new URL(
            translation.uri,
            process.env.NEXT_PUBLIC_SITE_URL ?? "https://simple-deutsch.de",
          );
          const normalizedPath = parsed.pathname.replace(/\/+$|^\/+/g, "");
          links[uiLang] = normalizedPath ? `/${normalizedPath}` : null;
        } catch (err) {
          console.error("Failed to normalize translation URI", err);
          links[uiLang] = null;
        }
      }
    });
  }

  if (!links[currentLocale]) {
    links[currentLocale] = `/${currentLocale}/posts/${post.slug}`;
  }

  return links;
}

// ðŸ‘‡ In Next 15, params is async. Type it as a Promise and ALWAYS await it.
type ParamsPromise = Promise<{ slug: string }>;

const fetchPost = cache(async (slug: string, locale: Locale) =>
  getPostBySlug(slug, {
    locale,
  }),
);

async function fetchMoreArticles(currentLang: LanguageSlug, currentSlug: string) {
  try {
    const res = await getPostsPageFiltered({ first: 12, locale: currentLang });
    const nodes = res.posts ?? [];
    return nodes
      .filter((p) => p.slug !== currentSlug)
      .slice(0, 4)
      .map((p) => ({ slug: p.slug, title: p.title }));
  } catch (err) {
    console.error("Failed to fetch more articles", err);
    return [] as { slug: string; title: string }[];
  }
}

export async function generatePostMetadata({
  params,
  locale,
}: {
  params: ParamsPromise;
  locale?: Locale;
}): Promise<Metadata> {
  const { slug } = await params;
  const resolvedLocale = locale ?? DEFAULT_LOCALE;
  const post = await fetchPost(slug, resolvedLocale);
  if (!post) return { title: TRANSLATIONS[DEFAULT_LOCALE].postNotFound };

  const title = post.seo?.title ?? post.title ?? "Simple Deutsch";
  const description = post.seo?.metaDesc ?? undefined;
  const translationMap: LocaleTranslationMap = buildPostTranslationMap(post, resolvedLocale);

  return {
    title,
    description,
    alternates: buildI18nAlternates(`/posts/${slug}`, resolvedLocale, { translationMap }),
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export async function renderPostPage({
  params,
  locale,
}: {
  params: ParamsPromise;
  locale?: Locale;
}) {
  const { slug } = await params; // âœ… must await
  const resolvedLocale = locale ?? DEFAULT_LOCALE;

  const post = await fetchPost(slug, resolvedLocale);
  if (!post) return notFound();

  const postLanguageFromGraphQL = getPostLanguageFromGraphQL(post);
  const desiredUiLang: LanguageSlug = resolvedLocale;

  const languageLinks = buildPostTranslationMap(post, desiredUiLang);

  // derive dynamic values
  const authorName = post.author?.node?.name ?? "Unknown author";
  const date = post.date ? new Date(post.date) : null;
  // Format date according to the page locale (map our site locale -> Intl locale)
  const localeForDate = resolvedLocale === "uk" ? "uk-UA" : resolvedLocale;
  const formattedDate = date
    ? date.toLocaleDateString(localeForDate, { year: "numeric", month: "long", day: "numeric" })
    : "";
  // Show all non-language categories (do not show language category)
  const visibleCategories = (post.categories?.nodes ?? [])
    .filter((c) => c && !isLocale(c.slug ?? ""))
    .filter((c) => !isHiddenCategory(c?.name, c?.slug));
  const showCategories = visibleCategories.length > 0;

  // Generate a table-of-contents and inject anchor ids into headings
  const { html: contentHtml, toc } = post.content
    ? generateTocFromHtml(post.content)
    : { html: "", toc: [] };
  const t = TRANSLATIONS[resolvedLocale];

  // Determine the current route/site language.
  // Prefer a `lang` route param when present (for pages under /[lang]/...),
  // otherwise fall back to the Next `locale` prop and finally to DEFAULT_LOCALE.
  const _allParams = (await params) as unknown as Record<string, string | undefined>;
  const paramLang = _allParams?.lang;
  const currentRouteLang: LanguageSlug =
    paramLang && isLocale(paramLang) ? paramLang : resolvedLocale;

  const currentLang = postLanguageFromGraphQL ?? resolvedLocale;

  const withLocaleHref = (lang: string, postSlug: string) => `/${lang}/posts/${postSlug}`;

  // fetch related / more posts for the sidebar â€” LANGUAGE ONLY (no topic/category logic)
  const moreArticles = await fetchMoreArticles(currentLang, post.slug);

  return (
    <>
      <PostLanguageLinksHydrator currentLang={desiredUiLang} links={languageLinks} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <article className="md:col-span-3" data-reading-target="post">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
              {post.title}
            </h1>

            {showCategories ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {visibleCategories.map((cat) => (
                  <Link
                    key={cat?.slug}
                    href={
                      resolvedLocale === "en"
                        ? `/categories/${cat?.slug}`
                        : `/${resolvedLocale}/categories/${cat?.slug}`
                    }
                    className="inline-block text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  >
                    {translateCategory(cat?.name, cat?.slug, resolvedLocale)}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center text-white text-base font-medium">
                {(authorName || "").charAt(0).toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium text-gray-900 dark:text-gray-100">{authorName}</div>
                <div className="dark:text-gray-400">
                  {formattedDate}
                  {formattedDate && post.readingText ? " · " : ""}
                  {post.readingText ?? ""}
                </div>
              </div>
            </div>

            <div className="sd-card p-8 mb-6">
              <h3 className="font-semibold text-lg mb-3">{t.tableOfContents}</h3>
              {toc.length ? (
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  {toc.map((t) => (
                    <li key={t.id} className={t.depth > 2 ? "pl-4" : ""}>
                      <a href={`#${t.id}`} className="hover:underline">
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-400">{t.noHeadings}</div>
              )}
            </div>

            {/* Render the post content using PostContent â€” content is sanitized server-side. */}
            {contentHtml ? <PostContent html={contentHtml} /> : null}
          </article>

          <aside className="md:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Promo rounded card (fill sidebar width) */}
              <div className="sd-card px-6 py-6 w-full text-center">
                <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  {t.promoHeading}
                </h3>
                <div className="flex justify-center">
                  <a
                    href="#top"
                    className="inline-block rounded-full bg-neutral-900 text-white px-6 py-2 text-base"
                  >
                    {t.promoCta}
                  </a>
                </div>
              </div>

              {/* More articles (no background/borders, fill sidebar width) */}
              <div className="px-3 py-3 rounded-xl w-full">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  {t.moreArticles}
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400">
                  {moreArticles.map((p) => (
                    <li
                      key={p.slug}
                      className="py-4 border-b border-slate-200 dark:border-slate-700 last:border-0"
                    >
                      <Link
                        href={withLocaleHref(currentRouteLang, p.slug)}
                        className="hover:underline block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
