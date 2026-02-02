// src/app/[locale]/(site)/search/page.tsx

import { notFound } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { assertLocale, type Locale } from "@/i18n/locale";
import SearchPage from "../../../search/page";

type SearchParams = Promise<{ q?: string; after?: string }>;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: SearchParams;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale);
    return { title: `${TRANSLATIONS[validated].search} — ${TRANSLATIONS[validated].siteTitle}` };
  } catch {
    return {};
  }
}

export default async function LocalizedSearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  const sp = searchParams ?? Promise.resolve({});

  return <SearchPage searchParams={sp} locale={validated} />;
}
