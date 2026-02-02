import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { LocaleProvider } from "@/core/i18n/LocaleProvider";
import { assertLocale } from "@/i18n/locale";

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  try {
    const loc = assertLocale(locale as any);
    return <LocaleProvider locale={loc}>{children}</LocaleProvider>;
  } catch (_e) {
    notFound();
  }
}
