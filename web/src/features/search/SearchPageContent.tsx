import { Suspense } from "react";
import PostCard from "@/features/posts/PostCard";
import SearchBox from "@/features/search/SearchBox";
import { searchPosts } from "@/server/wp/search";
import type { WPPostCard } from "@/server/wp/types";
import { formatTranslation, getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import PageHeading from "@/shared/ui/PageHeading";
import Section from "@/shared/ui/Section";

export type SearchParams = Promise<{ after?: string; q?: string }>;

type SearchPageContentProps = {
  searchParams: SearchParams;
  locale?: Locale;
};

const EMPTY_SEARCH_RESULT = {
  pageInfo: { endCursor: null as string | null, hasNextPage: false },
  posts: [] as WPPostCard[],
};

function getPostLanguageCode(locale: Locale): "EN" | "RU" | "UK" {
  if (locale === "uk") return "UK";
  if (locale === "ru") return "RU";
  return "EN";
}

function buildSearchPaginationHref(
  locale: Locale,
  query: string,
  endCursor: string | null,
): string {
  const params = new URLSearchParams({
    q: query,
    after: endCursor ?? "",
  });

  return `${buildLocalizedHref(locale, "/search")}?${params.toString()}`;
}

export default async function SearchPageContent({ searchParams, locale }: SearchPageContentProps) {
  const { after, q: rawQuery } = await searchParams;
  const query = (rawQuery ?? "").trim();
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const t = getTranslations(effectiveLocale);

  const result = query
    ? await searchPosts({
        query,
        first: 10,
        after: after ?? null,
        language: getPostLanguageCode(effectiveLocale),
        locale: effectiveLocale,
      })
    : EMPTY_SEARCH_RESULT;

  const hasPosts = result.posts.length > 0;
  const showEmptyState = Boolean(query) && !hasPosts;
  const nextPageHref = buildSearchPaginationHref(effectiveLocale, query, result.pageInfo.endCursor);

  return (
    <Section as="main" containerSize="narrow" spacing="md">
      <div className="flex flex-col gap-[var(--space-8)]">
        <PageHeading
          title={t["search.title"]}
          description={!query ? t["search.prompt"] : undefined}
        />
        <Suspense fallback={null}>
          <SearchBox autoFocus />
        </Suspense>

        {showEmptyState ? (
          <p className="text-[var(--sd-text-muted)]">
            {formatTranslation(t["search.noResults"], { query })}
          </p>
        ) : null}

        {hasPosts ? (
          <section aria-label={t["search.title"]} className="sd-post-grid sd-post-grid--compact">
            {result.posts.map((post) => (
              <div key={post.id ?? post.slug}>
                <PostCard post={post} />
              </div>
            ))}
          </section>
        ) : null}

        {result.pageInfo.hasNextPage ? (
          <div className="flex justify-center">
            <a
              href={nextPageHref}
              className="sd-button sd-button--pill sd-button--md sd-interactive"
            >
              {t["common.loadMore"]}
            </a>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
