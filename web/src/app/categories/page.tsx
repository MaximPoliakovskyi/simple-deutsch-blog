// app/categories/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { getAllCategories } from "@/lib/wp/api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Categories — Simple Deutsch",
  description: "Explore posts by category.",
};

export default async function CategoriesIndexPage() {
  // Your API expects one argument (e.g., { first: number })
  const { categories } = await getAllCategories({ first: 100 });

  // Support either categories.nodes or categories.edges -> node
  const nodes =
    (categories as any)?.nodes ??
    ((categories as any)?.edges?.map((e: any) => e?.node).filter(Boolean) ?? []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-semibold">Categories</h1>
      {nodes.length === 0 ? (
        <p className="text-neutral-600">No categories found.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((cat: any) => (
            <li
              key={cat.id}
              className="rounded-lg border border-neutral-200/60 p-4 dark:border-neutral-800/60"
            >
              <Link href={`/categories/${cat.slug}`} className="group block">
                <div className="mb-1 flex items-baseline justify-between">
                  <h2 className="text-lg font-medium group-hover:underline">{cat.name}</h2>
                  {typeof cat?.count === "number" && (
                    <span className="text-xs text-neutral-500">
                      {cat.count} {cat.count === 1 ? "post" : "posts"}
                    </span>
                  )}
                </div>
                {cat?.description ? (
                  <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
                    {cat.description}
                  </p>
                ) : (
                  <p className="text-sm text-neutral-500">Browse posts in {cat?.name}.</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
