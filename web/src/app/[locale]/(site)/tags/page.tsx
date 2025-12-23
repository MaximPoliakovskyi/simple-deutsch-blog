// src/app/[locale]/(site)/tags/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import TagsIndexPage from "../../../tags/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "ua") return {};

  return {
    title: `${TRANSLATIONS[locale].tags} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedTagsPage({ params }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  return <TagsIndexPage locale={locale} />;
}
