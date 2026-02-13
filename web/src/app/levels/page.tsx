// app/levels/page.tsx
import type { Metadata } from "next";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import { LevelsIndexContent } from "./LevelsIndexContent";

export const revalidate = 600;

export const metadata: Metadata = {
  title: `${TRANSLATIONS[DEFAULT_LOCALE].levels} — ${TRANSLATIONS[DEFAULT_LOCALE].siteTitle}`,
  description: "Explore posts by level.",
};

export default async function LevelsIndexPage() {
  return <LevelsIndexContent locale={DEFAULT_LOCALE} />;
}
