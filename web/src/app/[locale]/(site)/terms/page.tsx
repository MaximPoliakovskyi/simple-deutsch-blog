// src/app/[locale]/(site)/terms/page.tsx
// Localized route for /[locale]/terms — reuses the main TermsPage component.
// Verification checklist (minimal):
// - /terms        -> renders English title "Terms of Service" (existing behavior)
// - /en/terms     -> renders English title "Terms of Service"
// - /ru/terms     -> renders Russian title from i18n: "Условия использования" (or localized key)
// - /ua/terms     -> renders Ukrainian title from i18n: "Умови користування"

import { notFound } from "next/navigation";
import TermsPage from "../../../terms/page";

import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return ["en", "ru", "uk"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  try {
    const validated = assertLocale(locale as any);
    return { title: undefined };
  } catch {
    return {};
  }
}

export default async function LocalizedTerms({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  // validated above; proceed

  return <TermsPage locale={validated} />;
}
