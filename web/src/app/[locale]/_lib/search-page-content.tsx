import type { Metadata } from "next";
import { buildSearchMetadataCopy, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { getSearchPageResults, type WPPostCard } from "@/lib/posts";
import PostCard from "@/components/cards";
import SearchBox from "@/components/search-box";

export const dynamic = "force-dynamic";

export type SearchParams = Promise<{ after?: string; q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const copy = buildSearchMetadataCopy(DEFAULT_LOCALE, q);

  return {
    description: copy.description,
    title: `${copy.title} | Simple Deutsch`,
  };
}

export async function SearchPageContent({
  locale,
  searchParams,
}: {
  locale?: Locale;
  searchParams: SearchParams;
}) {
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const after = params.after ?? null;
  const t = TRANSLATIONS[effectiveLocale];
  const { posts, pageInfo } = query
    ? await getSearchPageResults({ after, first: 10, locale: effectiveLocale, query })
    : { pageInfo: { endCursor: null, hasNextPage: false }, posts: [] as WPPostCard[] };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">{t.search}</h1>
      <SearchBox className="mb-6" autoFocus placeholder={t.searchPlaceholder} />

      {!query && (
        <p className="text-neutral-600">
          Type to search posts. Try keywords like "grammar", "B1", or "vocabulary".
        </p>
      )}

      {query && posts.length === 0 && (
        <p className="text-neutral-600">
          No results for <span className="font-medium">"{query}"</span>. Try a different term.
        </p>
      )}

      <section className="grid gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>

      {query && pageInfo.hasNextPage ? (
        <div className="mt-8 flex justify-center">
          <a
            href={`${effectiveLocale === DEFAULT_LOCALE ? "" : `/${effectiveLocale}`}/search?q=${encodeURIComponent(query)}&after=${encodeURIComponent(pageInfo.endCursor ?? "")}`}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100"
          >
            {t.loadMore}
          </a>
        </div>
      ) : null}
    </main>
  );
}
