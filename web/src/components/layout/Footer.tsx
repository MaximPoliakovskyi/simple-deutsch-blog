"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId } from "react";

import FooterWordmark from "./FooterWordmark";

const TYPO_STYLE = { fontSize: "var(--text-base)", lineHeight: "var(--tw-leading, var(--text-base--line-height))" };

type LinkItem = { label: string; href: string; external?: boolean };
type Section = { title: string; items: LinkItem[] };

type Locale = "en" | "ua" | "ru";

const FOOTER_I18N: Record<Locale, { sections: Section[] }> = {
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
          { label: "Blog", href: "/blog" },
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
          { label: "Impressum", href: "/impressum" },
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Service", href: "/terms" },
          { label: "Cookie Settings", href: "/cookies" },
        ],
      },
      {
        title: "Language",
        items: [
          { label: "Українська", href: "#ua" },
          { label: "Русский", href: "#ru" },
          { label: "English", href: "#en" },
        ],
      },
    ],
  },
  ua: {
    sections: [
      {
        title: "Категорії",
        items: [
          { label: "Розмовна практика та вимова", href: "/categories/speaking-pronunciation" },
          { label: "Вправи та практика", href: "/categories/exercises-practice" },
          { label: "Граматика", href: "/categories/grammar" },
          { label: "Історії успіху", href: "/categories/success-stories" },
          { label: "Поради та мотивація", href: "/categories/tips-motivation" },
          { label: "Блог", href: "/blog" },
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
          { label: "Impressum", href: "/impressum" },
          { label: "Політика конфіденційності", href: "/privacy" },
          { label: "Умови користування", href: "/terms" },
          { label: "Налаштування файлів cookie", href: "/cookies" },
        ],
      },
      {
        title: "Мова",
        items: [
          { label: "Українська", href: "#ua" },
          { label: "Русский", href: "#ru" },
          { label: "English", href: "#en" },
        ],
      },
    ],
  },
  ru: {
    sections: [
      {
        title: "Категории",
        items: [
          { label: "Разговорная практика и произношение", href: "/categories/speaking-pronunciation" },
          { label: "Упражнения и практика", href: "/categories/exercises-practice" },
          { label: "Грамматика", href: "/categories/grammar" },
          { label: "Истории успеха", href: "/categories/success-stories" },
          { label: "Советы и мотивация", href: "/categories/tips-motivation" },
          { label: "Блог", href: "/blog" },
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
          { label: "Impressum", href: "/impressum" },
          { label: "Политика конфиденциальности", href: "/privacy" },
          { label: "Условия использования", href: "/terms" },
          { label: "Настройки файлов cookie", href: "/cookies" },
        ],
      },
      {
        title: "Язык",
        items: [
          { label: "Українська", href: "#ua" },
          { label: "Русский", href: "#ru" },
          { label: "English", href: "#en" },
        ],
      },
    ],
  },
};

function getLocaleFromPath(pathname: string | null | undefined): Locale {
  if (!pathname) return "en";
  const m = pathname.match(/^\/(ua|ru|en)(?:\/|$)/);
  if (m && (m[1] === "ua" || m[1] === "ru" || m[1] === "en")) return m[1] as Locale;
  return "en";
}

function replaceLocaleInPath(pathname: string, locale: string) {
  const re = /^\/(ua|ru|en)(\/|$)/;
  if (re.test(pathname)) {
    return pathname.replace(re, `/${locale}$2`);
  }
  return `/${locale}${pathname}`;
}

export default function Footer() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const locale = getLocaleFromPath(pathname);

  function handleLocaleSwitch(target: string) {
    const newPath = replaceLocaleInPath(pathname, target);
    router.replace(newPath);
  }

  // Theme-aware footer: light background in light mode, exact deep navy in dark mode.
  return (
    <footer className="bg-white dark:bg-[#0B1220]">
      <div className="max-w-7xl mx-auto px-4 pt-12 bg-white dark:bg-[#0B1220]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
          {FOOTER_I18N[locale].sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-medium text-slate-700 dark:text-slate-100" style={TYPO_STYLE}>
                {section.title}
              </h3>
              <div className="mt-3">
                <ul className="space-y-2 list-none p-0 m-0 leading-relaxed">
                  {section.items.map((item) => {
                    const isLangLink = section.title === (locale === "en" ? "Language" : locale === "ua" ? "Мова" : "Язык") && item.href.startsWith("#");
                    if (isLangLink) {
                      const target = item.href.replace("#", "");
                      return (
                        <li key={item.label}>
                          <button onClick={() => handleLocaleSwitch(target)} className="font-normal text-slate-600 dark:text-slate-400 hover:underline dark:hover:text-slate-200" style={TYPO_STYLE}>
                            {item.label}
                          </button>
                        </li>
                      );
                    }

                    if (item.external) {
                      return (
                        <li key={item.label}>
                          <a href={item.href} className="font-normal text-slate-600 dark:text-slate-300 hover:underline dark:hover:text-slate-200" rel="noopener noreferrer" style={TYPO_STYLE}>
                            {item.label}
                          </a>
                        </li>
                      );
                    }

                    return (
                      <li key={item.label}>
                            <Link href={item.href} className="font-normal text-slate-600 dark:text-slate-300 hover:underline dark:hover:text-slate-200" style={TYPO_STYLE}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Dynamic, container-constrained brand wordmark that always fits on one line */}
        <FooterWordmark />
      </div>
    </footer>
  );
}

