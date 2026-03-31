import type { Metadata } from "next";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import { LevelsIndexContent } from "../../[locale]/levels/levels-index-content";

export const revalidate = 600;

export const metadata: Metadata = {
  description: "Explore posts by level.",
  title: `${TRANSLATIONS[DEFAULT_LOCALE].levels} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
};

export default async function LevelsIndexPage() {
  return <LevelsIndexContent locale={DEFAULT_LOCALE} />;
}
