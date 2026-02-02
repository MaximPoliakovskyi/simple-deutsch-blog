// src/app/[locale]/(site)/about/page.tsx

import { notFound } from "next/navigation";
import { assertLocale, type Locale } from "@/i18n/locale";
import AboutPage from "../../../about/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedAbout({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale);
  } catch {
    notFound();
  }

  return <AboutPage locale={validated} />;
}
