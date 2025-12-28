import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostContent from "@/components/features/posts/PostContent";
import { generateTocFromHtml } from "@/core/content/generateToc";
import { isHiddenCategory } from "@/core/content/hiddenCategories";
import { translateCategory } from "@/core/i18n/categoryTranslations";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getPostBySlug, getPostsPage, getPostsPageByCategory } from "@/server/wp/api"; // adjust path if yours differs
import type { PostDetail, PostListItem } from "@/server/wp/api";

const LANGUAGE_SLUGS = ["en", "ru", "ua"] as const;
type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];
type PageInfo = { hasNextPage: boolean; endCursor: string | null };

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

// Optional: keep your ISR setting if you use it
export const revalidate = 300; // 5 minutes

// 👇 In Next 15, params is async. Type it as a Promise and ALWAYS await it.
type ParamsPromise = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: ParamsPromise }): Promise<Metadata> {
  const { slug } = await params; // ✅ must await

  const post = await getPostBySlug(slug);
  if (!post) return { title: TRANSLATIONS[DEFAULT_LOCALE].postNotFound };

  const title = post.seo?.title ?? post.title ?? "Simple Deutsch";
  const description = post.seo?.metaDesc ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}

export default async function PostPage({
  params,
  locale,
}: {
  params: ParamsPromise;
  locale?: "en" | "ru" | "ua";
}) {
  const { slug } = await params; // ✅ must await

  // Try primary lookup by slug. Some WordPress setups or malformed links
  // (encoding, trailing slashes, unexpected prefixes) may cause the direct
  // GraphQL lookup to fail. Attempt a small fallback search before returning
  // a 404 so we can recover in more cases.
  let post = await getPostBySlug(slug);

  async function findPostFallback(slugToCheck: string): Promise<PostDetail | null> {
    // try decoding URI components and simple normalizations
    const candidates = [
      slugToCheck,
      decodeURIComponent(slugToCheck || ""),
      slugToCheck.replace(/^\/+/, ""),
      slugToCheck.replace(/\.html?$/i, ""),
    ];
    // fetch a modest page of posts and try to match by slug
    try {
      const page: { posts: PostListItem[]; pageInfo: PageInfo } = await getPostsPage({ first: 50 });
      const nodes = page.posts ?? [];
      for (const cand of candidates) {
        const found = nodes.find((n) => n.slug === cand);
        if (found) {
          // fetch full post detail for rendering
          const full = await getPostBySlug(found.slug);
          if (full) return full;
        }
      }
    } catch (err) {
      // ignore and fall through
      console.error("Fallback post search failed:", err);
    }
    return null;
  }

  if (!post) {
    post = await findPostFallback(slug);
  }

  if (!post) return notFound();

  

  // We render static article content for this page (screenshot example).

  // derive dynamic values
  const authorName = post.author?.node?.name ?? "Unknown author";
  const date = post.date ? new Date(post.date) : null;
  // Format date according to the page locale (map our site locale -> Intl locale)
  const localeForDate = (locale ?? DEFAULT_LOCALE) === "ua" ? "uk-UA" : (locale ?? DEFAULT_LOCALE);
  const formattedDate = date
    ? date.toLocaleDateString(localeForDate, { year: "numeric", month: "long", day: "numeric" })
    : "";
  // Show all non-language categories (do not show language category)
  const visibleCategories = (post.categories?.nodes ?? [])
    .filter((c) => c && !(LANGUAGE_SLUGS as readonly string[]).includes(c.slug ?? ""))
    .filter((c) => !isHiddenCategory(c?.name, c?.slug));
  const showCategories = visibleCategories.length > 0;
  const _firstCategoryForFetch = visibleCategories.length > 0 ? visibleCategories[0] : null;

  // compute read time (approx) from word count (200 wpm)
  const words = post.content
    ? post.content
        .replace(/<[^>]+>/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  const readMinutes = Math.max(1, Math.ceil(words / 200));

  // Generate a table-of-contents and inject anchor ids into headings
  const { html: contentHtml, toc } = post.content
    ? generateTocFromHtml(post.content)
    : { html: "", toc: [] };
  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];

  // Determine the current route/site language.
  // Prefer a `lang` route param when present (for pages under /[lang]/...),
  // otherwise fall back to the Next `locale` prop and finally to DEFAULT_LOCALE.
  const _allParams = (await params) as unknown as Record<string, string | undefined>;
  const paramLang = _allParams?.lang as LanguageSlug | undefined;
  const currentRouteLang: LanguageSlug = paramLang && (LANGUAGE_SLUGS as readonly string[]).includes(paramLang)
    ? (paramLang as LanguageSlug)
    : ((locale ?? DEFAULT_LOCALE) as LanguageSlug);

  const currentLang = getPostLanguage(post) ?? (locale ?? DEFAULT_LOCALE);

  const withLocaleHref = (lang: string, postSlug: string) =>
    lang === DEFAULT_LOCALE ? `/posts/${postSlug}` : `/${lang}/posts/${postSlug}`;

  // fetch related / more posts for the sidebar — LANGUAGE ONLY (no topic/category logic)
  let moreArticles: { slug: string; title: string }[] = [];
  try {
    const allLangRes: { posts: PostListItem[]; pageInfo: PageInfo } = await getPostsPageByCategory({
      first: 20,
      categorySlug: currentLang,
    });
    const nodes = allLangRes.posts ?? [];
    moreArticles = nodes
      .filter((p) => p.slug !== post.slug)
      // safety: ensure post language matches currentLang
      .filter((p) => getPostLanguage(p) === currentLang)
      .map((p) => ({ slug: p.slug, title: p.title }))
      .slice(0, 4);
  } catch (err) {
    // If the language-based fetch fails for some reason, fall back to an empty list.
    console.error("Failed to fetch language posts for moreArticles:", err);
    moreArticles = [];
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <article className="md:col-span-3">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            {post.title}
          </h1>

          {showCategories ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {visibleCategories.map((cat) => (
                <Link
                  key={cat?.slug}
                  href={
                    (locale ?? DEFAULT_LOCALE) === "en"
                      ? `/categories/${cat?.slug}`
                      : `/${locale}/categories/${cat?.slug}`
                  }
                  className="inline-block text-sm bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  {translateCategory(cat?.name, cat?.slug, locale ?? DEFAULT_LOCALE)}
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
                {formattedDate} · {readMinutes} {t.minRead}
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

          {/* Render the post content using PostContent — content is sanitized server-side. */}
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
                  href="#"
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
                    <Link href={withLocaleHref(currentRouteLang, p.slug)} className="hover:underline block">
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
  );
}
