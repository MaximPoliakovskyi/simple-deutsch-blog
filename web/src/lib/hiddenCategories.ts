// Central list and helper to filter out categories we don't want to show
// across the UI (e.g. language categories used only for WP internals).
// Keep this small and conservative: it checks both name and slug with a
// few common latin and cyrillic variants so the filter works for both
// English and localized term names.

const HIDDEN_KEYS = [
  // English forms
  "english",
  "russian",
  "ukrainian",
  // Cyrillic / localized forms commonly used
  "українська",
  "русский",
  "английский",
  "англ",
];

export function isHiddenCategory(name?: string | null, slug?: string | null) {
  const nameLower = (name ?? "").toLowerCase();
  const slugLower = (slug ?? "").toLowerCase();

  return HIDDEN_KEYS.some((k) => nameLower.includes(k) || slugLower === k || slugLower.includes(k));
}

export function filterHiddenCategories<T extends { name?: string | null; slug?: string | null }>(
  nodes: T[] | undefined | null,
): T[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((n) => !isHiddenCategory(n.name, n.slug));
}

export const HIDDEN_CATEGORY_KEYS = HIDDEN_KEYS;
