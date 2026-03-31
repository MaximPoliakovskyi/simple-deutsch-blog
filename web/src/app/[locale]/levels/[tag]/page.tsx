import { notFound } from "next/navigation";
import { assertLocale, getLevelLabel, type Locale, TRANSLATIONS } from "@/lib/i18n";
import { getTagBySlug } from "@/lib/posts";
import { buildI18nAlternates } from "@/lib/seo";
import { LevelPageContent } from "./level-page-content";

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
        alternates: buildI18nAlternates(`/levels/${tag}`, validated),
        title: TRANSLATIONS[validated].levelNotFound,
      };
    }

    const t = TRANSLATIONS[validated];
    const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
    const code = tag.toUpperCase();
    const levelLabel = getLevelLabel(tag, validated);
    const title =
      levelLabel && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(code)
        ? `${prefix} ${code} (${levelLabel}) — ${t.siteTitle}`
        : `${prefix} ${term.name} — ${t.siteTitle}`;

    return {
      alternates: buildI18nAlternates(`/levels/${tag}`, validated),
      title,
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

  return <LevelPageContent locale={validated} tag={tag} />;
}
