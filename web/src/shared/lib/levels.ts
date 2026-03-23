import { getTranslations } from "@/shared/i18n/i18n";
import type { Locale } from "@/shared/i18n/locale";

export const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

type CefrCode = (typeof CEFR_ORDER)[number];
type CefrTitleKey = `cefr.${CefrCode}.title`;
type CefrDescriptionKey = `cefr.${CefrCode}.description`;

export type CeFrLevel = {
  description: Partial<Record<Locale, string>>;
  label: Partial<Record<Locale, string>>;
  slug: string;
};

const CEFR_ORDER_INDEX = new Map(CEFR_ORDER.map((code, index) => [code, index]));

function levelLabel(code: CefrCode, locale: Locale) {
  const key = `cefr.${code}.title` as CefrTitleKey;
  const dictionary = getTranslations(locale);
  return `${code} - ${dictionary[key]}`;
}

function levelDescription(code: CefrCode, locale: Locale) {
  const key = `cefr.${code}.description` as CefrDescriptionKey;
  const dictionary = getTranslations(locale);
  return dictionary[key];
}

export const CEFR_LEVELS: CeFrLevel[] = CEFR_ORDER.map((code) => {
  const slug = code.toLowerCase();

  return {
    description: {
      en: levelDescription(code, "en"),
      ru: levelDescription(code, "ru"),
      uk: levelDescription(code, "uk"),
    },
    label: {
      en: levelLabel(code, "en"),
      ru: levelLabel(code, "ru"),
      uk: levelLabel(code, "uk"),
    },
    slug,
  };
});

export const CEFR_SLUGS = CEFR_LEVELS.map((level) => level.slug) as string[];

export const CEFR_UI_CONFIG: Record<string, { dotClass: string; emoji: string }> = {
  A1: { dotClass: "bg-green-500", emoji: "\u{1F7E2}" },
  A2: { dotClass: "bg-yellow-400", emoji: "\u{1F7E1}" },
  B1: { dotClass: "bg-orange-500", emoji: "\u{1F7E0}" },
  B2: { dotClass: "bg-red-500", emoji: "\u{1F534}" },
  C1: { dotClass: "bg-purple-500", emoji: "\u{1F7E3}" },
  C2: { dotClass: "bg-[var(--sd-text)]", emoji: "\u26AB" },
};

export function getLevelBySlug(slug?: string | null) {
  if (!slug) return undefined;
  const normalizedSlug = String(slug).toLowerCase();
  return CEFR_LEVELS.find((level) => level.slug === normalizedSlug);
}

export function getLevelLabel(slug?: string | null, locale: Locale = "en") {
  const level = getLevelBySlug(slug);
  if (!level) return undefined;
  return level.label[locale] ?? level.label.en;
}

export function getLevelDescription(slug?: string | null, locale: Locale = "en") {
  const level = getLevelBySlug(slug);
  if (!level) return undefined;
  return level.description[locale] ?? level.description.en;
}

export function getCefrCodeFromSlug(slug?: string | null) {
  if (!slug) return undefined;
  const normalized = slug.toUpperCase();
  return CEFR_ORDER.includes(normalized as CefrCode) ? (normalized as CefrCode) : undefined;
}

export function getCefrOrderIndex(slug?: string | null) {
  const code = getCefrCodeFromSlug(slug);
  return code ? (CEFR_ORDER_INDEX.get(code) ?? Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;
}

export function isCefrLevelSlug(slug?: string | null) {
  return Boolean(getCefrCodeFromSlug(slug));
}

export default CEFR_LEVELS;
