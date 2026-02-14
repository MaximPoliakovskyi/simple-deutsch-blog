// app/levels/[tag]/page.tsx
import type { Metadata } from "next";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { getTagBySlug } from "@/server/wp/api";
import { LevelPageContent } from "./LevelPageContent";

export const revalidate = 600;

type Params = { tag: string };

type TagNode = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params;
  const term = (await getTagBySlug(tag)) as TagNode | null;
  if (!term) return { title: TRANSLATIONS[DEFAULT_LOCALE].levelNotFound };
  const t = TRANSLATIONS[DEFAULT_LOCALE];
  const prefix = (t["level.titlePrefix"] as string) ?? (t.levelLabel as string) ?? "Level:";
  const CEFR_BY_SLUG = { a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1", c2: "C2" } as const;
  const code = CEFR_BY_SLUG[(tag ?? "").toLowerCase() as keyof typeof CEFR_BY_SLUG];
  const levelLabel = code ? ((t[`cefr.${code}.title`] as string) ?? undefined) : undefined;
  const { CEFR_UI_CONFIG } = await import("@/core/cefr/levels");
  const emoji = code ? (CEFR_UI_CONFIG[code]?.emoji ?? "") : "";
  const title =
    code && levelLabel
      ? `${prefix} ${emoji ? `${emoji} ` : ""}${code} (${levelLabel}) — ${t.siteTitle}`
      : `${prefix} ${term.name} — ${t.siteTitle}`;
  return {
    title,
    description: term.description ?? `Posts tagged with “${term.name}”`,
  };
}

export default async function LevelPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  return <LevelPageContent tag={tag} locale={DEFAULT_LOCALE} />;
}
