// src/app/[locale]/(site)/privacy/page.tsx

import { notFound } from "next/navigation";
import PrivacyPage from "../../../privacy/page";
import { assertLocale, type Locale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedPrivacy({ params }: Props) {
  const { locale } = await params;
  let validated: Locale;
  try {
    validated = assertLocale(locale as any);
  } catch {
    notFound();
  }

  return <PrivacyPage locale={validated as any} />;
}
