type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  [key: string]: unknown;
};

export function deduplicateCategories<T extends CategoryNode>(categories: T[]): T[] {
  return categories.filter((category) => {
    const name = category.name ?? "";
    return !/[\u0400-\u04FF]/.test(name);
  });
}

export function filterOutCEFRLevels<T extends CategoryNode>(categories: T[]): T[] {
  const cefrSlugs = new Set(["a1", "a2", "b1", "b2", "c1", "c2"]);
  return categories.filter((category) => !cefrSlugs.has((category.slug ?? "").toLowerCase()));
}
