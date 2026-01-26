// src/app/[locale]/(site)/levels/[tag]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { getTagBySlug } from "@/server/wp/api";
import LevelPage from "../../../../levels/[tag]/page";

const SUPPORTED_LOCALES = ["ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string; tag: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, tag } = await params;
  if (!isSupportedLocale(locale)) return {};

  const term = (await getTagBySlug(tag)) as any;
  if (!term) return { title: TRANSLATIONS[locale].levelNotFound };

  const t = TRANSLATIONS[locale];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? (t[`cefr.${code}.title`] as string) : undefined;
  const title = code && levelLabel ? `${prefix} ${code} (${levelLabel}) — ${t.siteTitle}` : `${prefix} ${term.name} — ${t.siteTitle}`;

  return {
    title,
  };
}

export default async function LocalizedLevelPage({ params }: Props) {
  const { locale, tag } = await params;

  if (locale !== "ru" && locale !== "uk") {
    notFound();
  }

  return await LevelPage({
    params: Promise.resolve({ tag }),
    locale,
  } as any);
}
