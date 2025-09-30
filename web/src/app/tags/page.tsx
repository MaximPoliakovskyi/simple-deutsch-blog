// app/tags/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags } from "@/lib/wp/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Tags — Simple Deutsch",
  description: "Explore posts by tag.",
};

export default async function TagsIndexPage() {
  // Your API probably has a getAllTags helper similar to getAllCategories
  const { tags } = await getAllTags({ first: 100 });

  const nodes =
    (tags as any)?.nodes ??
    ((tags as any)?.edges?.map((e: any) => e?.node).filter(Boolean) ?? []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-semibold">Tags</h1>
      {nodes.length === 0 ? (
        <p className="text-neutral-600">No tags found.</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {nodes.map((tag: any) => (
            <li key={tag.id}>
              <Link
                href={`/tags/${tag.slug}`}
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
