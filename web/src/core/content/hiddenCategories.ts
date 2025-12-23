const HIDDEN_KEYS = [
  "english",
  "russian",
  "ukrainian",
  "українська",
  "русский",
  "английский",
  "англ",
  "английский",
] as const;

export function isHiddenCategory(name?: string | null, slug?: string | null) {
  const nameLower = (name ?? "").toLowerCase();
  const slugLower = (slug ?? "").toLowerCase();
  return HIDDEN_KEYS.some((k) => nameLower.includes(k) || slugLower === k || slugLower.includes(k));
}

export function filterHiddenCategories<T extends { name?: string | null; slug?: string | null }>(
  nodes: T[] | undefined | null,
): T[] {
  return Array.isArray(nodes) ? nodes.filter((n) => !isHiddenCategory(n.name, n.slug)) : [];
}
