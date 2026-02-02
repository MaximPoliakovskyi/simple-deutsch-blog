/**
 * Utility functions for working with WordPress categories across multiple languages.
 */

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
};

/**
 * Filters categories to remove language duplicates.
 *
 * WordPress stores separate category records for each language (e.g., "Grammar",
 * "Граматика", "Грамматика"). This function keeps only the English (canonical)
 * version of each category. The translations are handled on the client side via
 * the translateCategory function.
 *
 * @param categories - Array of category nodes from WordPress
 * @returns Deduplicated array with only English category versions
 */
export function deduplicateCategories<T extends CategoryNode>(categories: T[]): T[] {
  return categories.filter((cat) => {
    const name = cat.name ?? "";
    // Keep only categories without Cyrillic characters (indicating English version)
    const hasCyrillic = /[\u0400-\u04FF]/.test(name);
    return !hasCyrillic;
  });
}

/**
 * Filters out CEFR level categories (A1-C2).
 *
 * CEFR levels are stored as categories in WordPress but are displayed separately
 * in the CategoriesBlock component as tags/pills.
 *
 * @param categories - Array of category nodes from WordPress
 * @returns Array with CEFR level categories removed
 */
export function filterOutCEFRLevels<T extends CategoryNode>(categories: T[]): T[] {
  const CEFR_SLUGS = ["a1", "a2", "b1", "b2", "c1", "c2"];
  return categories.filter((cat) => !CEFR_SLUGS.includes((cat.slug ?? "").toLowerCase()));
}
