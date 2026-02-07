// src/app/[locale]/(site)/levels/[tag]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import { buildI18nAlternates } from "@/i18n/seo";
import { getTagBySlug } from "@/server/wp/api";
import LevelPage from "../../../../levels/[tag]/page";

type Props = {
  params: Promise<{ locale: string; tag: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, tag } = await params;
  try {
    const validated = assertLocale(locale);
    const term = await getTagBySlug(tag, validated);
    if (!term) {
      return {
        title: TRANSLATIONS[validated].levelNotFound,
        alternates: buildI18nAlternates(`/levels/${tag}`, validated),
      };
    }

    const t = TRANSLATIONS[validated];
    const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
    const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
    const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
    const levelLabel = code ? (t[`cefr.${code}.title`] as string) : undefined;
    const title =
      code && levelLabel
        ? `${prefix} ${code} (${levelLabel}) — ${t.siteTitle}`
        : `${prefix} ${term.name} — ${t.siteTitle}`;

    return {
      title,
      alternates: buildI18nAlternates(`/levels/${tag}`, validated),
    };
  } catch {
    return {};
  }
}

export default async function LocalizedLevelPage({ params }: Props) {
  const { locale, tag } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return LevelPage({ params: Promise.resolve({ tag }), locale: validated });
}
