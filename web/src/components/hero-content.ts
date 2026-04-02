import type { Locale } from "@/lib/i18n";

const HERO_STABLE_WIDTH_CH: Record<string, number> = {
  en: 8.5,
  uk: 12,
  ru: 14,
};

const HERO_STATIC_LINE_CLASS_NAMES: Record<
  string,
  { titleClassName: string; line1ClassName: string; line2ClassName: string }
> = {
  en: {
    titleClassName: "",
    line1ClassName: "block whitespace-nowrap",
    line2ClassName: "block whitespace-normal text-balance min-[430px]:whitespace-nowrap",
  },
  uk: {
    titleClassName: "lg:max-w-[980px] xl:max-w-[1100px]",
    line1ClassName: "mx-auto block whitespace-normal text-balance",
    line2ClassName: "mx-auto block whitespace-normal text-balance",
  },
  ru: {
    titleClassName: "lg:max-w-[980px] xl:max-w-[1100px]",
    line1ClassName: "mx-auto block whitespace-normal text-balance",
    line2ClassName: "mx-auto block whitespace-normal text-balance",
  },
};

/** Animated keyword lists per locale — rotate through these in the hero. */
export const HERO_KEYWORDS: Record<string, string[]> = {
  en: ["work", "travel", "life", "goals"],
  uk: ["роботи", "подорожей", "навчання", "мрій"],
  ru: ["работы", "путешествий", "учёбы", "мечты"],
};

export function getHeroStableWidthCh(locale: Locale | string) {
  return HERO_STABLE_WIDTH_CH[locale] ?? HERO_STABLE_WIDTH_CH.en;
}

export function getHeroStaticLineClassNames(locale: Locale | string) {
  return HERO_STATIC_LINE_CLASS_NAMES[locale] ?? HERO_STATIC_LINE_CLASS_NAMES.en;
}
