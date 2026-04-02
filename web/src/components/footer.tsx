import Link from "next/link";
import { normalizeLevelSlug, sortWordPressBadgesByCefr } from "@/lib/cefr";
import {
  buildLocalizedHref,
  type CefrLevelCode,
  DEFAULT_LOCALE,
  getCefrLevelLabel,
  type Locale,
  TRANSLATIONS,
} from "@/lib/i18n";
import { getLocaleAwareTaxonomySlug, getWordPressLevelBadges } from "@/lib/posts";

const TYPO_STYLE = {
  fontSize: "var(--text-base)",
  lineHeight: "var(--tw-leading, var(--text-base--line-height))",
};

type LinkItem = { label: string; href: string; external?: boolean };
type SectionKey = "categories" | "levels" | "platform" | "community" | "legal";
type Section = { key: SectionKey; title: string; items: LinkItem[] };
const FOOTER_LEVEL_SLUGS = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;
type FooterLevelSlug = (typeof FOOTER_LEVEL_SLUGS)[number];

const FOOTER_I18N: Partial<Record<Locale, { sections: Section[] }>> = {
  en: {
    sections: [
      {
        key: "categories",
        title: "Categories",
        items: [
          { label: "Speaking & Pronunciation", href: "/categories/speaking-pronunciation" },
          { label: "Exercises & Practice", href: "/categories/exercises-practice" },
          { label: "Grammar", href: "/categories/grammar" },
          { label: "Success Stories", href: "/categories/success-stories" },
          { label: "Tips & Motivation", href: "/categories/tips-motivation" },
          { label: "Vocabulary", href: "/categories/vocabulary" },
        ],
      },
      {
        key: "levels",
        title: "Levels",
        items: [],
      },
      {
        key: "platform",
        title: "Platform",
        items: [
          { label: "About the project", href: "/about" },
          { label: "Team", href: "/team" },
          { label: "Partnerships", href: "/partnerships" },
        ],
      },
      {
        key: "community",
        title: "Community",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
        key: "legal",
        title: "Legal",
        items: [
          { label: "Imprint", href: "/imprint" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Cookie Settings", href: "/cookies" },
        ],
      },
    ],
  },
  uk: {
    sections: [
      {
        key: "categories",
        title: "Категорії",
        items: [
          { label: "Розмовна практика та вимова", href: "/categories/speaking-pronunciation" },
          { label: "Вправи та практика", href: "/categories/exercises-practice" },
          { label: "Граматика", href: "/categories/grammar" },
          { label: "Історії успіху", href: "/categories/success-stories" },
          { label: "Поради та мотивація", href: "/categories/tips-motivation" },
          { label: "Словник", href: "/categories/vocabulary" },
        ],
      },
      {
        key: "levels",
        title: "Рівні",
        items: [],
      },
      {
        key: "platform",
        title: "Платформа",
        items: [
          { label: "Про проєкт", href: "/about" },
          { label: "Команда", href: "/team" },
          { label: "Партнерства", href: "/partnerships" },
        ],
      },
      {
        key: "community",
        title: "Спільнота",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
        key: "legal",
        title: "Правова інформація",
        items: [
          { label: "Юридична інформація", href: "/imprint" },
          { label: "Політика конфіденційності", href: "/privacy" },
          { label: "Умови користування", href: "/terms" },
          { label: "Налаштування файлів cookie", href: "/cookies" },
        ],
      },
    ],
  },
  ru: {
    sections: [
      {
        key: "categories",
        title: "Категории",
        items: [
          {
            label: "Разговорная практика и произношение",
            href: "/categories/speaking-pronunciation",
          },
          { label: "Упражнения и практика", href: "/categories/exercises-practice" },
          { label: "Грамматика", href: "/categories/grammar" },
          { label: "Истории успеха", href: "/categories/success-stories" },
          { label: "Советы и мотивация", href: "/categories/tips-motivation" },
          { label: "Словарь", href: "/categories/vocabulary" },
        ],
      },
      {
        key: "levels",
        title: "Уровни",
        items: [],
      },
      {
        key: "platform",
        title: "Платформа",
        items: [
          { label: "О проекте", href: "/about" },
          { label: "Команда", href: "/team" },
          { label: "Партнёрства", href: "/partnerships" },
        ],
      },
      {
        key: "community",
        title: "Сообщество",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
        key: "legal",
        title: "Юридическая информация",
        items: [
          { label: "Выходные данные", href: "/imprint" },
          { label: "Политика конфиденциальности", href: "/privacy" },
          { label: "Условия использования", href: "/terms" },
          { label: "Настройки файлов cookie", href: "/cookies" },
        ],
      },
    ],
  },
};

function prefixHrefForLocale(href: string, locale: Locale) {
  if (!href || !href.startsWith("/")) return href;
  return buildLocalizedHref(locale, href);
}

function toCefrLevelCode(level: FooterLevelSlug): CefrLevelCode {
  return level.toUpperCase() as CefrLevelCode;
}

function buildFooterLevelFallbackItems(locale: Locale): LinkItem[] {
  return FOOTER_LEVEL_SLUGS.map((level) => ({
    label: getCefrLevelLabel(locale, toCefrLevelCode(level)),
    href: `/levels/${getLocaleAwareTaxonomySlug(level, locale)}`,
  }));
}

function buildFooterLevelItems(
  locale: Locale,
  badges: Array<{ slug?: string | null; name?: string | null }>,
): LinkItem[] {
  const itemsByLevel = new Map<FooterLevelSlug, LinkItem>();

  for (const badge of sortWordPressBadgesByCefr(badges)) {
    const level = normalizeLevelSlug(badge.slug) ?? normalizeLevelSlug(badge.name);
    if (!level || !badge.slug) {
      continue;
    }

    const footerLevel = level as FooterLevelSlug;
    if (itemsByLevel.has(footerLevel)) {
      continue;
    }

    itemsByLevel.set(footerLevel, {
      label: getCefrLevelLabel(locale, toCefrLevelCode(footerLevel)),
      href: `/levels/${footerLevel}`,
    });
  }

  if (itemsByLevel.size === FOOTER_LEVEL_SLUGS.length) {
    return FOOTER_LEVEL_SLUGS.map((level) => itemsByLevel.get(level)).filter(
      (item): item is LinkItem => Boolean(item),
    );
  }

  return buildFooterLevelFallbackItems(locale);
}

export default async function Footer({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const configuredSections = (FOOTER_I18N[locale] ?? FOOTER_I18N[DEFAULT_LOCALE])?.sections ?? [];
  const levelItems = buildFooterLevelItems(
    locale,
    await getWordPressLevelBadges(locale).catch(() => []),
  );
  const sections: Section[] = configuredSections
    .map((section) =>
      section.key === "levels"
        ? {
            ...section,
            items: levelItems,
          }
        : section,
    )
    .filter((section) => section.key === "levels" || section.items.length > 0);
  const copyrightTemplate =
    dictionary["footer.copyright"] ||
    "(c) {year} Simple Deutsch. All rights reserved. German-language learning platform.";
  const currentYear = String(new Date().getFullYear());

  return (
    <footer className="bg-[#FFFFFF] dark:bg-[#0B101E] min-h-[28rem] md:min-h-[24rem]">
      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
            {sections.map((section) => (
              <div key={section.key}>
                <h3
                  className="type-ui-label text-slate-900 dark:text-[rgba(255,255,255,0.92)]"
                  style={TYPO_STYLE}
                >
                  {section.title}
                </h3>
                <div className="mt-3">
                  <ul className="space-y-2 list-none p-0 m-0 leading-relaxed">
                    {section.items.map((item) => {
                      const resolvedLabel =
                        item.href === "/impressum" ? dictionary.imprint || item.label : item.label;

                      if (item.external) {
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              className="font-normal hover:underline text-slate-700 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-[rgba(255,255,255,0.9)] hover:text-slate-900"
                              rel="noopener noreferrer"
                              style={TYPO_STYLE}
                            >
                              {resolvedLabel}
                            </a>
                          </li>
                        );
                      }

                      return (
                        <li key={item.label}>
                          <Link
                            href={prefixHrefForLocale(item.href, locale)}
                            className="font-normal hover:underline text-slate-700 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-[rgba(255,255,255,0.9)] hover:text-slate-900"
                            style={TYPO_STYLE}
                          >
                            {resolvedLabel}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="h-px w-full bg-black/10 dark:bg-white/10" />

          <div className="py-4 text-[12px] text-slate-700 dark:text-[rgba(255,255,255,0.7)]">
            {copyrightTemplate.replace("{year}", currentYear)}
          </div>
        </div>
      </div>
    </footer>
  );
}
