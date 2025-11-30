import type { ReactElement } from "react";
import CategoriesBlockClient from "./CategoriesBlockClient";
import { getAllTags } from "@/lib/wp/api";
import { fetchPosts, type Locale } from "@/lib/api";
import { extractConnectionNodes } from "@/lib/utils/normalizeConnection";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";
import { filterHiddenCategories } from "@/lib/hiddenCategories";

/**
 * Server component: fetches categories and a small posts page, then
 * renders the client component that provides interactivity.
 */
export default async function CategoriesBlock({ locale }: { locale?: "en" | "ru" | "ua" } = {}): Promise<ReactElement> {
  // Fetch a small set of tags to display in this block (we'll surface only
  // the level tags A1..C2 here). Keep the same client props shape so the
  // client component can be reused without layout changes.
  const tagsResp = await getAllTags({ first: 12 });
  type TagNode = { id: string; name: string; slug: string };
  const tags = extractConnectionNodes<TagNode>(tagsResp?.tags).map((t) => ({ id: t.id, name: t.name, slug: t.slug }));

  // Only show the CEFR level tags in the homepage block (A1..C2).
  const levelSlugs = ["a1", "a2", "b1", "b2", "c1", "c2"];
  const visibleCategories = tags.filter((t) => levelSlugs.includes((t.slug || "").toLowerCase()));

  // Use the shared helper `fetchPosts(locale)` which calls `/api/posts?lang=<locale>`
  // so the returned posts are language-scoped identically to the rest of the
  // homepage. `fetchPosts` returns a plain array of post objects.
  const effectiveLocale = (locale ?? DEFAULT_LOCALE) as Locale;
  const posts = await fetchPosts(effectiveLocale);

  // `fetchPosts` returns an array shaped like `WPPostCard[]`; use it directly
  // as the initial posts for the client component.
  const initialPosts = posts;
  const pageInfo = { endCursor: null, hasNextPage: false };

  return (
    // Match success stories slider background (full-bleed dark band)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
    <section aria-label={TRANSLATIONS[locale ?? DEFAULT_LOCALE].tags} data-categories-scope className="mx-auto max-w-7xl px-4 py-16 text-white">
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

  <h2 className="text-3xl font-extrabold mb-6">{TRANSLATIONS[locale ?? DEFAULT_LOCALE].tagsHeading}</h2>

        {/* Client component gets serializable props only */}
        <CategoriesBlockClient
          categories={visibleCategories}
          initialPosts={initialPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={3}
          locale={effectiveLocale}
        />
      </section>
    </div>
  );
}
