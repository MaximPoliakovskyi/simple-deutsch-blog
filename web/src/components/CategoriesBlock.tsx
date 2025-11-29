import type { ReactElement } from "react";
import CategoriesBlockClient from "./CategoriesBlockClient";
import { getAllCategories, getPostsPage } from "@/lib/wp/api";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/lib/i18n";

/**
 * Server component: fetches categories and a small posts page, then
 * renders the client component that provides interactivity.
 */
export default async function CategoriesBlock({ locale }: { locale?: "en" | "ru" | "ua" } = {}): Promise<ReactElement> {
  const catsResp = await getAllCategories({ first: 12 });
  const categories = (catsResp?.categories?.nodes ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const postsResp = await getPostsPage({ first: 3 });
  const initialPosts = postsResp.posts ?? [];
  const pageInfo = postsResp.pageInfo ?? { endCursor: null, hasNextPage: false };

  return (
    // Match success stories slider background (full-bleed dark band)
    <div className="dark -mx-[calc(50vw-50%)] w-screen bg-[#0B0D16]">
      <section aria-label={TRANSLATIONS[locale ?? DEFAULT_LOCALE].categories} data-categories-scope className="mx-auto max-w-7xl px-4 py-16 text-white">
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

  <h2 className="text-3xl font-extrabold mb-6">{TRANSLATIONS[locale ?? DEFAULT_LOCALE].categoriesHeading}</h2>

        {/* Client component gets serializable props only */}
        <CategoriesBlockClient
          categories={categories}
          initialPosts={initialPosts}
          initialEndCursor={pageInfo.endCursor}
          initialHasNextPage={pageInfo.hasNextPage}
          pageSize={3}
        />
      </section>
    </div>
  );
}
