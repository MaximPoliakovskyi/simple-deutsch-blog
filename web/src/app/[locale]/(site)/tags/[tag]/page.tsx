// src/app/[locale]/(site)/tags/[tag]/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { getTagBySlug } from "@/server/wp/api";
import TagPage from "../../../../tags/[tag]/page";

type Props = {
  params: Promise<{ locale: string; tag: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale, tag } = await params;
  if (locale !== "ru" && locale !== "ua") return {};

  const term = (await getTagBySlug(tag)) as any;
  if (!term) return { title: TRANSLATIONS[locale].tagNotFound };

  return {
    title: `Tag: ${term.name} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedTagPage({ params }: Props) {
  const { locale, tag } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  // Pass wrapped params to base TagPage
  return await TagPage({
    params: Promise.resolve({ tag }),
    locale,
  } as any);
}
