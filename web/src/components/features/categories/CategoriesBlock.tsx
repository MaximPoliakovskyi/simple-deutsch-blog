import type { ReactElement } from "react";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllTags } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";
import CategoriesBlockClient from "./CategoriesBlockClient";
import { CEFR_SLUGS } from "@/core/cefr/levels";

type Locale = "en" | "ru" | "ua";
type TagNode = { id: string; name: string; slug: string };
type Category = { id: string; name: string; slug: string };
type PageInfo = { endCursor: string | null; hasNextPage: boolean };

/**
 * Server component: fetches categories and a small posts page, then
 * renders the client component that provides interactivity.
 */
export default async function CategoriesBlock({
  locale,
}: {
  locale?: Locale;
} = {}): Promise<ReactElement> {
  // Fetch a small set of tags to display in this block (we'll surface only
  // the level tags A1..C2 here). Keep the same client props shape so the
  // client component can be reused without layout changes.
  const tagsResp = await getAllTags({ first: 12 });
  const tags = extractConnectionNodes<TagNode>(tagsResp?.tags).map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
  }));

  // Only show the CEFR level tags in the homepage block (A1..C2).
  const visibleCategories: Category[] = tags.filter((t) =>
    CEFR_SLUGS.includes((t.slug || "").toLowerCase()),
  );

  const defaultLocaleLocal: Locale = (DEFAULT_LOCALE === "de" ? "en" : (DEFAULT_LOCALE as Locale));
  const effectiveLocale: Locale = locale ?? defaultLocaleLocal;
  
  // For initial render, pass empty posts - client will fetch based on selected tag
  const firstTagSlug = visibleCategories.length > 0 ? visibleCategories[0].slug : null;
  const initialPosts: any[] = [];
  const pageInfo: PageInfo = { endCursor: null, hasNextPage: false };

  return (
    // Match success stories slider background (full-bleed dark band)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section
        aria-label={TRANSLATIONS[locale ?? DEFAULT_LOCALE].levels}
        data-categories-scope
        className="mx-auto max-w-7xl px-4 py-10 text-white"
      >
        <style>{`
          [data-categories-scope] h1,
          [data-categories-scope] h2,
          [data-categories-scope] h3,
          [data-categories-scope] h4,
          [data-categories-scope] h5,
          [data-categories-scope] h6,
          [data-categories-scope] h1 *,
          [data-categories-scope] h2 *,
          [data-categories-scope] h3 *,
          [data-categories-scope] h4 *,
          [data-categories-scope] h5 *,
          [data-categories-scope] h6 *,
          [data-categories-scope] .post-title,
          [data-categories-scope] [data-post-title],
          [data-categories-scope] .prose :where(h1,h2,h3,h4,h5,h6),
          [data-categories-scope] .prose :where(h1,h2,h3,h4,h5,h6) a {
            color: #ffffff !important;
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
            will-change: color;
          }
          [data-categories-scope] .group:hover h1,
          [data-categories-scope] .group:hover h2,
          [data-categories-scope] .group:hover h3,
          [data-categories-scope] .group:hover h4,
          [data-categories-scope] .group:hover h5,
          [data-categories-scope] .group:hover h6,
          [data-categories-scope] .group:focus-within h1,
          [data-categories-scope] .group:focus-within h2,
          [data-categories-scope] .group:focus-within h3,
          [data-categories-scope] .group:focus-within h4,
          [data-categories-scope] .group:focus-within h5,
          [data-categories-scope] .group:focus-within h6,
          [data-categories-scope] .group:hover h1 *,
          [data-categories-scope] .group:hover h2 *,
          [data-categories-scope] .group:hover h3 *,
          [data-categories-scope] .group:hover h4 *,
          [data-categories-scope] .group:hover h5 *,
          [data-categories-scope] .group:hover h6 *,
          [data-categories-scope] .group:focus-within h1 *,
          [data-categories-scope] .group:focus-within h2 *,
          [data-categories-scope] .group:focus-within h3 *,
          [data-categories-scope] .group:focus-within h4 *,
          [data-categories-scope] .group:focus-within h5 *,
          [data-categories-scope] .group:focus-within h6 * {
            color: #d1d5db !important; /* gray-300 */
            transition: color 420ms cubic-bezier(.22,1,.36,1) !important;
          }
        `}</style>

        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold mb-8">
            {TRANSLATIONS[locale ?? DEFAULT_LOCALE].levelsHeading}
          </h2>
          <p className="text-base leading-relaxed text-gray-300 max-w-2xl">
            {TRANSLATIONS[locale ?? DEFAULT_LOCALE].levelsDescription}
          </p>
        </div>

        {/* Client component gets serializable props only */}
        <div className="mt-8">
          <CategoriesBlockClient
          categories={visibleCategories}
          initialPosts={initialPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={3}
          locale={effectiveLocale}
          />
        </div>
      </section>
    </div>
  );
}
