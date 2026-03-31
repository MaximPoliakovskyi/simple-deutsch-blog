import type { Metadata } from "next";
import { DEFAULT_LOCALE, getLevelLabel, TRANSLATIONS } from "@/lib/i18n";
import { getTagBySlug } from "@/lib/posts";
import { LevelPageContent } from "../../../[locale]/levels/[tag]/level-page-content";

export const revalidate = 600;

type Params = { tag: string };

type TagNode = {
  description?: string | null;
  id: string;
  name: string;
  slug: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as TagNode | null;

  if (!term) {
    return { title: TRANSLATIONS[DEFAULT_LOCALE].levelNotFound };
  }

  const t = TRANSLATIONS[DEFAULT_LOCALE];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const code = tag.toUpperCase();
  const levelLabel = getLevelLabel(tag, DEFAULT_LOCALE);
  const { CEFR_UI_CONFIG } = await import("@/lib/i18n");
  const emoji =
    levelLabel && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(code)
      ? (CEFR_UI_CONFIG[code as keyof typeof CEFR_UI_CONFIG]?.emoji ?? "")
      : "";
  const title =
    levelLabel && ["A1", "A2", "B1", "B2", "C1", "C2"].includes(code)
      ? `${prefix} ${emoji ? `${emoji} ` : ""}${code} (${levelLabel}) — ${t.siteTitle}`
      : `${prefix} ${term.name} — ${t.siteTitle}`;

  return {
    description: term.description ?? `Posts tagged with “${term.name}”`,
    title,
  };
}

export default async function LevelPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  return <LevelPageContent locale={DEFAULT_LOCALE} tag={tag} />;
}
