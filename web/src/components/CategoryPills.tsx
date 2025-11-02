"use client";

import * as React from "react";
import Link from "next/link";

type Cat = { id: string; name: string; slug: string };

export default function CategoryPills({
  categories,
  onSelect,
  initialSelected,
  alignment = "center",
  required = false,
}: {
  categories: Cat[];
  onSelect: (slug: string | null) => void;
  initialSelected?: string | null;
  /** Layout alignment for the pills: 'left' or 'center' (default: center) */
  alignment?: "left" | "center";
  /** When true, a category must always be selected and cannot be deselected */
  required?: boolean;
}) {
  // If `required` is true and no explicit initialSelected was provided, default
  // to the first category's slug when categories are available.
  const defaultSelected = React.useMemo(() => {
    if (initialSelected !== undefined && initialSelected !== null) return initialSelected;
    if (required) return categories.length > 0 ? categories[0].slug : null;
    return null;
  }, [initialSelected, required, categories]);

  const [selected, setSelected] = React.useState<string | null>(defaultSelected ?? null);

  React.useEffect(() => {
    // keep parent in sync
    onSelect(selected);
  }, [selected, onSelect]);

  const containerClass = `mt-8 flex flex-wrap gap-3 ${alignment === "center" ? "justify-center" : "justify-start"}`;

  return (
    <div className={containerClass}>
      {categories.length === 0 ? (
        <div className="text-sm text-neutral-500 dark:text-neutral-400">No categories found.</div>
      ) : (
        categories.map((cat) => {
          // active only when the category slug matches the selected value
          const active = selected === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                setSelected((s) => {
                  if (required) {
                    // If required, never clear selection; clicking the active stays active
                    return cat.slug;
                  }
                  return s === cat.slug ? null : cat.slug;
                })
              }
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
