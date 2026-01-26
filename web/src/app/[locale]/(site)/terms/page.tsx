// src/app/[locale]/(site)/terms/page.tsx
// Localized route for /[locale]/terms — reuses the main TermsPage component.
// Verification checklist (minimal):
// - /terms        -> renders English title "Terms of Service" (existing behavior)
// - /en/terms     -> renders English title "Terms of Service"
// - /ru/terms     -> renders Russian title from i18n: "Условия использования" (or localized key)
// - /ua/terms     -> renders Ukrainian title from i18n: "Умови користування"

import { notFound } from "next/navigation";
import TermsPage from "../../../terms/page";

const SUPPORTED_LOCALES = ["en", "ru", "uk"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
const isSupportedLocale = (locale: string): locale is SupportedLocale =>
  SUPPORTED_LOCALES.includes(locale as SupportedLocale);

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  return {
    title: undefined,
  };
}

export default async function LocalizedTerms({ params }: Props) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return <TermsPage locale={locale as any} />;
}
