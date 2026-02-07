// app/search/page.tsx
import type { Metadata } from "next";
import PostCard from "@/components/features/posts/PostCard";
import SearchBox from "@/components/features/search/SearchBox";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";
import { searchPosts, type WPPostCard } from "@/server/wp/api";

// Dynamic render for fresh search each request
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; after?: string }>;
type SearchResult = {
  posts: WPPostCard[];
  pageInfo: { endCursor: string | null; hasNextPage: boolean };
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  return {
    title: q ? `Search: ${q} | Simple Deutsch` : "Search | Simple Deutsch",
    description: q ? `Results for “${q}”.` : "Search posts.",
  };
}

export default async function SearchPage(
  { searchParams, locale }: { searchParams: SearchParams; locale?: Locale } = {
    searchParams: Promise.resolve({}),
  },
) {
  const sp = await searchParams; // Next 15: must await dynamic APIs
  const q = (sp.q ?? "").trim();
  const after = sp.after ?? null;
  const effectiveLocale = locale ?? DEFAULT_LOCALE;
  const t = TRANSLATIONS[effectiveLocale];

  // For Russian/Ukrainian sites, don't search if query contains only Latin characters
  let posts: WPPostCard[] = [];
  let pageInfo = { endCursor: null as string | null, hasNextPage: false };

  const shouldSkipSearch =
    (effectiveLocale === "uk" || effectiveLocale === "ru") &&
    q &&
    /^[a-zA-Z0-9\s\-_.,!?]+$/.test(q);

  if (!shouldSkipSearch && q) {
    // Map UI locale to WordPress language code for filtering at WordPress level
    const wpLang = effectiveLocale === "uk" ? "UK" : effectiveLocale === "ru" ? "RU" : "EN";
    const result: SearchResult = await searchPosts({
      query: q,
      first: 10,
      after,
      language: wpLang,
      locale: effectiveLocale,
    });
    posts = result.posts;
    pageInfo = result.pageInfo;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">{t.search}</h1>
      <SearchBox className="mb-6" autoFocus placeholder={t.searchPlaceholder} />

      {!q && (
        <p className="text-neutral-600">
          Type to search posts. Try keywords like “grammar”, “B1”, or “vocabulary”.
        </p>
      )}

      {q && posts.length === 0 && (
        <p className="text-neutral-600">
          No results for <span className="font-medium">“{q}”</span>. Try a different term.
        </p>
      )}

      <section className="grid gap-6">
        {posts.map((p: WPPostCard) => (
          <PostCard key={p.id} post={p} />
        ))}
      </section>

      {q && pageInfo.hasNextPage ? (
        <div className="mt-8 flex justify-center">
          <a
            href={`${locale ? `/${locale}` : ""}/search?q=${encodeURIComponent(q)}&after=${encodeURIComponent(pageInfo.endCursor ?? "")}`}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100"
          >
            {t.loadMore}
          </a>
        </div>
      ) : null}
    </main>
  );
}
