// app/tags/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import { getAllTags } from "@/server/wp/api";
import { extractConnectionNodes } from "@/server/wp/normalizeConnection";

// helper removed; using shared `extractConnectionNodes` from utils

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].tags} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by tag.",
};

export default async function TagsIndexPage({ locale }: { locale?: "en" | "ru" | "ua" } = {}) {
  // Your API probably has a getAllTags helper similar to getAllCategories
  const { tags } = await getAllTags({ first: 100 });

  type TagNode = { id: string; name: string; slug: string };
  const nodes = extractConnectionNodes<TagNode>(tags);

  const t = TRANSLATIONS[locale ?? DEFAULT_LOCALE];

  const prefix = locale && locale !== DEFAULT_LOCALE ? `/${locale}` : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-semibold">{t.tagsHeading}</h1>
      {nodes.length === 0 ? (
        <p className="text-neutral-600">{t.noResults}</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {nodes.map((tag) => (
            <li key={tag.id}>
              <Link
                href={`${prefix}/tags/${tag.slug}`}
                className="inline-block rounded-lg border border-neutral-200/60 px-3 py-1 text-sm hover:bg-neutral-200/60 dark:border-neutral-800/60 dark:hover:bg-neutral-800/60"
              >
                {tag.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
