import { TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";

export type CeFrLevel = {
  slug: string;
  /** Short display label used in UI (e.g. "A1 — Beginner") */
  label: Partial<Record<Locale, string>>;
  /** Short description/tooltip (single-line) */
  description: Partial<Record<Locale, string>>;
};

export const CEFR_LEVELS: CeFrLevel[] = [
  {
    slug: "a1",
    label: {
      en: "A1 — Beginner",
      uk: TRANSLATIONS.uk.a1Title,
      ru: TRANSLATIONS.ru.a1Title,
    },
    description: {
      en: "Beginner",
      uk: TRANSLATIONS.uk.a1Description,
      ru: TRANSLATIONS.ru.a1Description,
    },
  },
  {
    slug: "a2",
    label: {
      en: "A2 — Elementary",
      uk: TRANSLATIONS.uk.a2Title,
      ru: TRANSLATIONS.ru.a2Title,
    },
    description: {
      en: "Elementary",
      uk: TRANSLATIONS.uk.a2Description,
      ru: TRANSLATIONS.ru.a2Description,
    },
  },
  {
    slug: "b1",
    label: {
      en: "B1 — Intermediate",
      uk: TRANSLATIONS.uk.b1Title,
      ru: TRANSLATIONS.ru.b1Title,
    },
    description: {
      en: "Intermediate",
      uk: TRANSLATIONS.uk.b1Description,
      ru: TRANSLATIONS.ru.b1Description,
    },
  },
  {
    slug: "b2",
    label: {
      en: "B2 — Upper-intermediate",
      uk: TRANSLATIONS.uk.b2Title,
      ru: TRANSLATIONS.ru.b2Title,
    },
    description: {
      en: "Upper-intermediate",
      uk: TRANSLATIONS.uk.b2Description,
      ru: TRANSLATIONS.ru.b2Description,
    },
  },
  {
    slug: "c1",
    label: {
      en: "C1 — Advanced",
      uk: TRANSLATIONS.uk.c1Title,
      ru: TRANSLATIONS.ru.c1Title,
    },
    description: {
      en: "Advanced",
      uk: TRANSLATIONS.uk.c1Description,
      ru: TRANSLATIONS.ru.c1Description,
    },
  },
  {
    slug: "c2",
    label: {
      en: "C2 — Near-native",
      uk: TRANSLATIONS.uk.c2Title,
      ru: TRANSLATIONS.ru.c2Title,
    },
    description: {
      en: "Near-native",
      uk: TRANSLATIONS.uk.c2Description,
      ru: TRANSLATIONS.ru.c2Description,
    },
  },
];

export function getLevelBySlug(slug?: string | null) {
  if (!slug) return undefined;
  const normalized = String(slug).toLowerCase();
  return CEFR_LEVELS.find((l) => l.slug === normalized);
}

export function getLevelLabel(slug?: string | null, locale: Locale = "en") {
  const lvl = getLevelBySlug(slug);
  if (!lvl) return undefined;
  return lvl.label[locale] ?? lvl.label.en;
}

export function getLevelDescription(slug?: string | null, locale: Locale = "en") {
  const lvl = getLevelBySlug(slug);
  if (!lvl) return undefined;
  return lvl.description[locale] ?? lvl.description.en;
}

export const CEFR_SLUGS = CEFR_LEVELS.map((l) => l.slug) as string[];

export default CEFR_LEVELS;

// Client-side canonical ordering and UI config for CEFR levels
export const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const CEFR_UI_CONFIG: Record<string, { dotClass: string; emoji: string }> = {
  A1: { dotClass: "bg-green-500", emoji: "🟢" },
  A2: { dotClass: "bg-yellow-400", emoji: "🟡" },
  B1: { dotClass: "bg-orange-500", emoji: "🟠" },
  B2: { dotClass: "bg-red-500", emoji: "🔴" },
  C1: { dotClass: "bg-purple-500", emoji: "🟣" },
  C2: { dotClass: "bg-black", emoji: "⚫" },
};
