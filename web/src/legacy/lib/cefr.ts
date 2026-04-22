const CEFR_LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
const CEFR_LEVEL_ORDER_INDEX = new Map(
  CEFR_LEVEL_ORDER.map((level, index) => [level, index] as const),
);

const HEX_COLOR_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNCTION_COLOR_RE = /^(?:rgb|rgba|hsl|hsla|oklab|oklch)\(\s*[-\d.%\s,/]+\)$/i;

export function normalizeLevelSlug(slug?: string | null): string | null {
  if (!slug) {
    return null;
  }

  const normalized = slug.toLowerCase().trim().replace(/_/g, "-");
  const cleaned = normalized
    .replace(/^(?:cefrlevel-)/, "")
    .replace(/^(?:cefr-)/, "")
    .replace(/^(?:level-)/, "")
    .replace(/^(?:ger-)/, "");
  const tokens = cleaned.split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (["a1", "a2", "b1", "b2", "c1", "c2"].includes(token)) {
      return token;
    }
  }

  if (/\bc2\b/.test(cleaned)) return "c2";
  if (/\bc1\b/.test(cleaned)) return "c1";
  if (/\bb2\b/.test(cleaned)) return "b2";
  if (/\bb1\b/.test(cleaned)) return "b1";
  if (/\ba2\b/.test(cleaned)) return "a2";
  if (/\ba1\b/.test(cleaned)) return "a1";
  return null;
}

export function sanitizeLevelColor(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (HEX_COLOR_RE.test(trimmed) || FUNCTION_COLOR_RE.test(trimmed)) {
    return trimmed;
  }

  return null;
}

function getSortableLevelValue(value?: string | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function getCefrSortIndex(slug?: string | null, name?: string | null): number {
  const normalized = normalizeLevelSlug(slug) ?? normalizeLevelSlug(name);
  return normalized
    ? (CEFR_LEVEL_ORDER_INDEX.get(normalized as (typeof CEFR_LEVEL_ORDER)[number]) ??
        Number.MAX_SAFE_INTEGER)
    : Number.MAX_SAFE_INTEGER;
}

export function sortWordPressBadgesByCefr<T extends { slug?: string | null; name?: string | null }>(
  badges: T[],
): T[] {
  return [...badges].sort((a, b) => {
    const orderDiff = getCefrSortIndex(a.slug, a.name) - getCefrSortIndex(b.slug, b.name);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    const slugDiff = getSortableLevelValue(a.slug).localeCompare(
      getSortableLevelValue(b.slug),
      "en",
      {
        sensitivity: "base",
      },
    );
    if (slugDiff !== 0) {
      return slugDiff;
    }

    return getSortableLevelValue(a.name).localeCompare(getSortableLevelValue(b.name), "en", {
      sensitivity: "base",
    });
  });
}
