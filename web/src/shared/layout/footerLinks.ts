import type { Locale } from "@/shared/i18n/locale";

type FooterLinkItem = {
  external?: boolean;
  href: string;
  label: string;
};

type FooterSection = {
  items: FooterLinkItem[];
  title: string;
};

const FOOTER_SECTIONS: Record<Locale, FooterSection[]> = {
  en: [
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
        { label: "A1 - Beginner", href: "/levels/a1" },
        { label: "A2 - Elementary", href: "/levels/a2" },
        { label: "B1 - Intermediate", href: "/levels/b1" },
        { label: "B2 - Upper-Intermediate", href: "/levels/b2" },
        { label: "C1 - Advanced", href: "/levels/c1" },
        { label: "C2 - Proficient", href: "/levels/c2" },
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
      ],
    },
  ],
  uk: [
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
        { label: "A1 - Початковий", href: "/levels/a1" },
        { label: "A2 - Елементарний", href: "/levels/a2" },
        { label: "B1 - Середній", href: "/levels/b1" },
        { label: "B2 - Вище середнього", href: "/levels/b2" },
        { label: "C1 - Просунутий", href: "/levels/c1" },
        { label: "C2 - Професійний", href: "/levels/c2" },
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
      ],
    },
  ],
  ru: [
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
        { label: "A1 - Начальный", href: "/levels/a1" },
        { label: "A2 - Элементарный", href: "/levels/a2" },
        { label: "B1 - Средний", href: "/levels/b1" },
        { label: "B2 - Выше среднего", href: "/levels/b2" },
        { label: "C1 - Продвинутый", href: "/levels/c1" },
        { label: "C2 - Профессиональный", href: "/levels/c2" },
      ],
    },
    {
      title: "Платформа",
      items: [
        { label: "О проекте", href: "/about" },
        { label: "Команда", href: "/team" },
        { label: "Партнерства", href: "/partnerships" },
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
      ],
    },
  ],
};

export function getFooterSections(locale: Locale): FooterSection[] {
  return FOOTER_SECTIONS[locale] ?? FOOTER_SECTIONS.en;
}
