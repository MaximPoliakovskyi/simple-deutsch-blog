// src/app/[locale]/(site)/search/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import SearchPage from "../../../search/page";

type SearchParams = Promise<{ q?: string; after?: string }>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale !== "ru" && locale !== "ua") return {};

  return {
    title: `${TRANSLATIONS[locale].search} — ${TRANSLATIONS[locale].siteTitle}`,
  };
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;

  if (locale !== "ru" && locale !== "ua") {
    notFound();
  }

  const sp = searchParams ?? Promise.resolve({});

  return <SearchPage searchParams={sp} locale={locale} />;
}
