import Link from "next/link";
import { deduplicateCategories } from "@/core/content/categoryUtils";
import { filterHiddenCategories } from "@/core/content/hiddenCategories";
import { translateCategory, translateCategoryDescription } from "@/core/i18n/categoryTranslations";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";
import { getAllCategories, getPostsPageByCategory } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import { GET_ALL_CATEGORIES } from "@/server/wp/queries";

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  count?: number;
};

const REPLACEMENT_CHAR = "\uFFFD";

function inspectReplacement(value: string) {
  const index = value.indexOf(REPLACEMENT_CHAR);
  if (index < 0) return null;

  const start = Math.max(0, index - 10);
  const end = Math.min(value.length, index + 11);
  const context = value.slice(start, end);
  const codePoints = Array.from(context).map((char) => `U+${char.codePointAt(0)?.toString(16)}`);
  return { index, context, codePoints };
}

function logCategoryReplacementDiagnostics(
  nodes: CategoryNode[],
  locale: Locale,
  source: string,
  headerInfo?: { contentType: string | null; contentLength: string | null },
) {
  for (const category of nodes) {
    const fields: Array<["name" | "description", string]> = [];
    if (typeof category.name === "string") fields.push(["name", category.name]);
    if (typeof category.description === "string") fields.push(["description", category.description]);

    for (const [field, value] of fields) {
      if (!value.includes(REPLACEMENT_CHAR)) continue;
      const details = inspectReplacement(value);
      console.error("[categories][encoding][U+FFFD detected]", {
        locale,
        source,
        field,
        categoryId: category.id,
        categorySlug: category.slug,
        value,
        replacement: details,
        headers: headerInfo ?? null,
      });
    }
  }
}

async function runTransportDiagnostics(locale: Locale) {
  if (process.env.NODE_ENV === "production") return;
  if (locale !== "ru" && locale !== "uk") return;

  const globalKey = "__categoriesEncodingDiagnosticsRun";
  const globalState = globalThis as typeof globalThis & { [globalKey]?: Record<string, true> };
  globalState[globalKey] ??= {};
  if (globalState[globalKey][locale]) return;
  globalState[globalKey][locale] = true;

  const endpoint =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";
  const response = await fetch(endpoint, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-simple-deutsch-locale": locale,
    },
    body: JSON.stringify({
      query: GET_ALL_CATEGORIES,
      variables: { first: 100, after: null },
    }),
  });

  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  const bytes = new Uint8Array(await response.arrayBuffer());

  const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const windows1251Text = new TextDecoder("windows-1251", { fatal: false }).decode(bytes);
  const utf8HasReplacement = utf8Text.includes(REPLACEMENT_CHAR);
  const windows1251HasReplacement = windows1251Text.includes(REPLACEMENT_CHAR);

  console.info("[categories][encoding][transport]", {
    locale,
    status: response.status,
    contentType,
    contentLength,
    byteLength: bytes.length,
    utf8HasReplacement,
    windows1251HasReplacement,
  });

  if (utf8HasReplacement) {
    console.error("[categories][encoding][transport] UTF-8 decoded payload contains U+FFFD", {
      locale,
      details: inspectReplacement(utf8Text),
    });
  }

  try {
    const parsed = JSON.parse(utf8Text) as {
      data?: { categories?: { nodes?: CategoryNode[] } };
      errors?: Array<{ message?: string }>;
    };

    if (parsed.errors?.length) {
      console.error("[categories][encoding][transport] GraphQL errors", {
        locale,
        errors: parsed.errors.map((error) => error.message ?? "Unknown error"),
      });
    }

    const nodes = parsed.data?.categories?.nodes ?? [];
    logCategoryReplacementDiagnostics(nodes, locale, "raw transport utf-8 decode", {
      contentType,
      contentLength,
    });
  } catch (error) {
    console.error("[categories][encoding][transport] JSON parse failed", {
      locale,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function CategoriesIndexContent({ locale }: { locale: Locale }) {
  await runTransportDiagnostics(locale);

  const { categories } = await getAllCategories({ first: 100 });
  const nodes = extractConnectionNodes<CategoryNode>(categories);
  if (process.env.NODE_ENV !== "production" && (locale === "ru" || locale === "uk")) {
    logCategoryReplacementDiagnostics(nodes, locale, "after fetchGraphQL res.json()");
  }

  const visible = filterHiddenCategories(deduplicateCategories(nodes));
  const lang = locale;
  const t = TRANSLATIONS[lang];

  const countsBySlug = await Promise.all(
    visible.map(async (category) => {
      try {
        let { posts: postsForCategory } = await getPostsPageByCategory({
          first: 200,
          categorySlug: category.slug,
          locale: lang,
        });

        if (!postsForCategory || postsForCategory.length === 0) {
          const { posts: postsNoLang } = await getPostsPageByCategory({
            first: 200,
            categorySlug: category.slug,
          });
          postsForCategory = postsNoLang;
        }

        const count = postsForCategory?.length ?? 0;
        return [category.slug, count] as const;
      } catch {
        return [category.slug, 0] as const;
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-8 text-3xl font-semibold">{t.categoriesHeading}</h1>
      {visible.length === 0 ? (
        <p className="text-neutral-600">{t.noCategories}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((category) => (
            <li
              key={category.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link
                href={
                  lang === "en" ? `/categories/${category.slug}` : `/${lang}/categories/${category.slug}`
                }
                className="group block"
              >
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">
                    {translateCategory(category.name, category.slug, lang)}
                  </h2>
                  {(() => {
                    const count = countsMap.get(category.slug) ?? 0;
                    return (
                      <span className="text-xs text-neutral-500">
                        {formatPostCount(count, lang)}
                      </span>
                    );
                  })()}
                </div>
                {(() => {
                  const translated = translateCategoryDescription(
                    category.description,
                    category.slug,
                    lang,
                  );
                  const final = translated ?? category.description ?? null;
                  if (final) {
                    return (
                      <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                        {final}
                      </p>
                    );
                  }
                  return (
                    <p className="text-sm text-neutral-500">
                      Browse posts in {translateCategory(category.name, category.slug, lang)}.
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

