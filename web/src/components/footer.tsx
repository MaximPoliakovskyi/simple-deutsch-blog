import Link from "next/link";
import { normalizeLevelSlug, sortWordPressBadgesByCefr } from "@/lib/cefr";
import {
  buildLocalizedHref,
  type CefrLevelCode,
  DEFAULT_LOCALE,
  getCefrLevelLabel,
  type Locale,
  TRANSLATIONS,
  translateCategory,
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
    if (!level || !badge.slug) continue;
    const footerLevel = level as FooterLevelSlug;
    if (itemsByLevel.has(footerLevel)) continue;
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

const CATEGORY_SLUGS = [
  "speaking-pronunciation",
  "exercises-practice",
  "grammar",
  "success-stories",
  "tips-motivation",
  "vocabulary",
] as const;

function buildSections(locale: Locale, levelItems: LinkItem[]): Section[] {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];

  return [
    {
      key: "categories",
      title: t.categories ?? "Categories",
      items: CATEGORY_SLUGS.map((slug) => ({
        label: translateCategory(null, slug, locale),
        href: `/categories/${slug}`,
      })),
    },
    {
      key: "levels",
      title: t.levels ?? "Levels",
      items: levelItems,
    },
    {
      key: "platform",
      title: t["footer.section.platform"] ?? "Platform",
      items: [
        { label: t["footer.link.aboutProject"] ?? "About the project", href: "/about" },
        { label: t.team ?? "Team", href: "/team" },
        { label: t["footer.link.partnerships"] ?? "Partnerships", href: "/partnerships" },
      ],
    },
    {
      key: "community",
      title: t["footer.section.community"] ?? "Community",
      items: [
        { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
        { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
      ],
    },
    {
      key: "legal",
      title: t["footer.section.legal"] ?? "Legal",
      items: [
        { label: t.imprint ?? "Imprint", href: "/imprint" },
        { label: t["footer.link.privacyPolicy"] ?? "Privacy Policy", href: "/privacy" },
        { label: t["footer.link.termsOfService"] ?? "Terms of Service", href: "/terms" },
        { label: t["footer.link.cookieSettings"] ?? "Cookie Settings", href: "/cookies" },
      ],
    },
  ];
}

export default async function Footer({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const levelItems = buildFooterLevelItems(
    locale,
    await getWordPressLevelBadges(locale).catch(() => []),
  );
  const sections = buildSections(locale, levelItems).filter(
    (section) => section.key === "levels" || section.items.length > 0,
  );
  const copyrightTemplate =
    dictionary["footer.copyright"] ||
    "(c) {year} Simple Deutsch. All rights reserved. German-language learning platform.";
  const currentYear = String(new Date().getFullYear());

  return (
    <footer className="bg-[#FFFFFF] dark:bg-[#0B101E] min-h-[32rem] md:min-h-[28rem]">
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
