// src/app/[locale]/(site)/privacy/page.tsx

import { notFound } from "next/navigation";
import PrivacyPage from "../../../privacy/page";

const SUPPORTED_LOCALES = ["en", "ru", "ua"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPrivacy({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <PrivacyPage locale={locale as any} />;
}
