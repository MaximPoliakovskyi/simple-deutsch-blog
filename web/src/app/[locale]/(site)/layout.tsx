import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { assertLocale } from "@/i18n/locale";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  try {
    assertLocale(locale);
    return children;
  } catch (_e) {
    notFound();
  }
}
