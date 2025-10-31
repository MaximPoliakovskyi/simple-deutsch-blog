"use client";

import * as React from "react";
import Link from "next/link";

type Cat = { id: string; name: string; slug: string };

export default function CategoryPills({
  categories,
  onSelect,
  initialSelected,
}: {
  categories: Cat[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
}) {
  const [selected, setSelected] = React.useState<string | null>(initialSelected ?? null);

  React.useEffect(() => {
    // keep parent in sync
    onSelect(selected);
  }, [selected, onSelect]);

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {categories.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">No categories found.</div>
      ) : (
        categories.map((cat, i) => {
          const active = selected === cat.slug || (selected === null && i === 0 && selected === null);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelected((s) => (s === cat.slug ? null : cat.slug))}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border shadow-sm focus:outline-none transition-colors ${
                active
                  ? "bg-white dark:bg-neutral-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 ring-2 ring-blue-50"
                  : "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700 hover:bg-slate-200 dark:hover:bg-neutral-700"
              }`}
            >
              {cat.name}
            </button>
          );
        })
      )}
    </div>
  );
}
