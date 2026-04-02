import "server-only";

import { cache } from "react";
import { normalizeLevelSlug, sanitizeLevelColor } from "@/lib/cefr";
import type { Locale } from "@/lib/i18n";
import { CACHE_TAGS } from "@/server/cache";
import { fetchJson } from "@/server/client";

type WPRestTagRecord = {
  slug?: string | null;
  name?: string | null;
  color?: unknown;
  levelColor?: unknown;
  badgeColor?: unknown;
  accentColor?: unknown;
  dotColor?: unknown;
  meta?: Record<string, unknown> | unknown[] | null;
  acf?: Record<string, unknown> | null;
  style?: Record<string, unknown> | null;
  badgeStyle?: Record<string, unknown> | null;
  levelStyle?: Record<string, unknown> | null;
};

// WordPress encodes badge colors as colored circle emoji in the tag name
// (e.g. "🟢 A1 (Beginner)") because no custom color fields are configured.
// Map each emoji to a CSS hex color so we can surface the WP-intended color.
const EMOJI_TO_HEX: Record<string, string> = {
  "\u{1F7E2}": "#22c55e", // 🟢 green  — A1
  "\u{1F7E1}": "#eab308", // 🟡 yellow — A2
  "\u{1F7E0}": "#f97316", // 🟠 orange — B1
  "\u{1F534}": "#ef4444", // 🔴 red    — B2
  "\u{1F7E3}": "#a855f7", // 🟣 purple — C1
  "\u26AB": "#3f3f46", // ⚫ dark   — C2
};

function colorFromTagName(name: string | null | undefined): string | null {
  if (!name) return null;
  for (const [emoji, hex] of Object.entries(EMOJI_TO_HEX)) {
    if (name.includes(emoji)) return hex;
  }
  return null;
}

const COLOR_KEYS = [
  "levelColor",
  "level_color",
  "badgeColor",
  "badge_color",
  "accentColor",
  "accent_color",
  "dotColor",
  "dot_color",
  "color",
  "hexColor",
  "hex_color",
  "value",
  "hex",
] as const;

function pickColorCandidate(record: Record<string, unknown>): string | null {
  for (const key of COLOR_KEYS) {
    const candidate = record[key];
    if (typeof candidate === "string") {
      const color = sanitizeLevelColor(candidate);
      if (color) {
        return color;
      }
    }

    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const nestedColor = pickColorCandidate(candidate as Record<string, unknown>);
      if (nestedColor) {
        return nestedColor;
      }
    }
  }

  return null;
}

function extractLevelColor(tag: WPRestTagRecord): string | null {
  const directColor = pickColorCandidate(tag as Record<string, unknown>);
  if (directColor) {
    return directColor;
  }

  for (const nested of [tag.acf, tag.meta, tag.style, tag.badgeStyle, tag.levelStyle]) {
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      const nestedColor = pickColorCandidate(nested as Record<string, unknown>);
      if (nestedColor) {
        return nestedColor;
      }
    }
  }

  // Fallback: extract color from WP emoji convention in tag name (e.g. "🟢 A1")
  return colorFromTagName(tag.name);
}

const getWordPressLevelColorLookup = cache(async () => {
  const endpoint =
    "https://cms.simple-deutsch.de/wp-json/wp/v2/tags?per_page=100&hide_empty=false&acf_format=standard";
  const tags = await fetchJson<WPRestTagRecord[]>(endpoint, {
    locale: "en" as Locale,
    policy: {
      type: "ISR",
      revalidate: 600,
      tags: [CACHE_TAGS.tags, "levels:styles"],
    },
  });

  // Key by normalized CEFR code ("a1"–"c2") so that Polylang-translated slugs
  // like "a1-ru" and "a1-uk" all resolve to the same color as their EN counterpart.
  const byCefrCode = new Map<string, string | null>();

  for (const tag of tags) {
    const slug = String(tag.slug ?? "")
      .toLowerCase()
      .trim();
    const code = normalizeLevelSlug(slug);
    if (!slug || !code) {
      continue;
    }

    const color = extractLevelColor(tag);
    // Only set if we have a real color (don't overwrite a good color with null)
    if (color !== null || !byCefrCode.has(code)) {
      byCefrCode.set(code, color);
    }
  }

  return { byCefrCode };
});

export async function getWordPressLevelColor(slug?: string | null): Promise<string | null> {
  const code = normalizeLevelSlug(slug);
  if (!code) {
    return null;
  }

  const lookup = await getWordPressLevelColorLookup();
  return lookup.byCefrCode.get(code) ?? null;
}

export async function withWordPressLevelColor<
  T extends { slug: string; levelColor?: string | null },
>(term: T): Promise<T> {
  const color = sanitizeLevelColor(term.levelColor) ?? (await getWordPressLevelColor(term.slug));
  return {
    ...term,
    levelColor: color,
  };
}

export async function withWordPressLevelColors<
  T extends { slug: string; levelColor?: string | null },
>(terms: T[]): Promise<T[]> {
  const lookup = await getWordPressLevelColorLookup();

  return terms.map((term) => {
    const code = normalizeLevelSlug(term.slug);
    const color =
      sanitizeLevelColor(term.levelColor) ?? (code ? (lookup.byCefrCode.get(code) ?? null) : null);

    return {
      ...term,
      levelColor: color,
    };
  });
}
