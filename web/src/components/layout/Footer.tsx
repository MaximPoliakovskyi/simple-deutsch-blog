import Link from "next/link";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { buildLocalizedHref } from "@/core/i18n/localeLinks";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";

const TYPO_STYLE = {
  fontSize: "var(--text-base)",
  lineHeight: "var(--tw-leading, var(--text-base--line-height))",
};

type LinkItem = { label: string; href: string; external?: boolean };
type Section = { title: string; items: LinkItem[] };

const FOOTER_I18N: Partial<Record<Locale, { sections: Section[] }>> = {
  en: {
    sections: [
      {
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
        title: "Levels",
        items: [
          { label: "A1 — Beginner", href: "/levels/a1" },
          { label: "A2 — Elementary", href: "/levels/a2" },
          { label: "B1 — Intermediate", href: "/levels/b1" },
          { label: "B2 — Upper-Intermediate", href: "/levels/b2" },
          { label: "C1 — Advanced", href: "/levels/c1" },
          { label: "C2 — Proficient", href: "/levels/c2" },
        ],
      },
      {
        title: "Platform",
        items: [
          { label: "About the project", href: "/about" },
          { label: "Team", href: "/team" },
          { label: "Partnerships", href: "/partnerships" },
        ],
      },
      {
        title: "Community",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
        title: "Legal",
        items: [
          { label: "Imprint", href: "/imprint" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Cookie Settings", href: "/cookies" },
        ],
      },
      // Language switcher intentionally omitted from footer; navigation owns locale switching.
    ],
  },
  uk: {
    sections: [
      {
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
        title: "Рівні",
        items: [
          { label: "A1 — Початковий", href: "/levels/a1" },
          { label: "A2 — Елементарний", href: "/levels/a2" },
          { label: "B1 — Середній", href: "/levels/b1" },
          { label: "B2 — Вище середнього", href: "/levels/b2" },
          { label: "C1 — Просунутий", href: "/levels/c1" },
          { label: "C2 — Професійний", href: "/levels/c2" },
        ],
      },
      {
        title: "Платформа",
        items: [
          { label: "Про проєкт", href: "/about" },
          { label: "Команда", href: "/team" },
          { label: "Партнерства", href: "/partnerships" },
        ],
      },
      {
        title: "Спільнота",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
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
        title: "Уровни",
        items: [
          { label: "A1 — Начальный", href: "/levels/a1" },
          { label: "A2 — Элементарный", href: "/levels/a2" },
          { label: "B1 — Средний", href: "/levels/b1" },
          { label: "B2 — Выше среднего", href: "/levels/b2" },
          { label: "C1 — Продвинутый", href: "/levels/c1" },
          { label: "C2 — Профессиональный", href: "/levels/c2" },
        ],
      },
      {
        title: "Платформа",
        items: [
          { label: "О проекте", href: "/about" },
          { label: "Команда", href: "/team" },
          { label: "Партнёрства", href: "/partnerships" },
        ],
      },
      {
        title: "Сообщество",
        items: [
          { label: "Email", href: "mailto:hello@simpledeutsch.com", external: true },
          { label: "GitHub", href: "https://github.com/simple-deutsch", external: true },
        ],
      },
      {
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

export default function Footer({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const sections = (FOOTER_I18N[locale] ?? FOOTER_I18N[DEFAULT_LOCALE])?.sections ?? [];
  const copyrightTemplate =
    dictionary["footer.copyright"] ||
    "(c) {year} Simple Deutsch. All rights reserved. German-language learning platform.";
  const currentYear = String(new Date().getFullYear());

  // Footer: light theme uses pure white (#FFFFFF); dark theme uses deep navy (#0B101E).
  // Footer root is the single source of truth for background color.
  return (
    <footer className="bg-[#FFFFFF] dark:bg-[#0B101E] min-h-[28rem] md:min-h-[24rem]">
      {/* main footer background area (no inner background so it inherits from footer root) */}
      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h3
                  className="font-medium text-slate-900 dark:text-[rgba(255,255,255,0.92)]"
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

      {/* bottom bar area: full-width background with container-aligned content (no bg here) */}
      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          {/* divider aligned to container: light mode black/10, dark mode white/10 */}
          <div className="h-px w-full bg-black/10 dark:bg-white/10" />

          {/* copyright row aligned to container; text colors remain theme-aware elsewhere */}
          <div className="py-4 text-[12px] text-slate-700 dark:text-[rgba(255,255,255,0.7)]">
            {copyrightTemplate.replace("{year}", currentYear)}
          </div>
        </div>
      </div>
    </footer>
  );
}
