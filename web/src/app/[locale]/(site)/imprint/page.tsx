// src/app/[locale]/(site)/imprint/page.tsx
import { notFound } from "next/navigation";
import ImprintPage from "../../../imprint/page";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return ["en", "ru", "uk"].map((locale) => ({ locale }));
}

export default async function LocalizedImprint({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  return <ImprintPage locale={validated as any} />;
}
