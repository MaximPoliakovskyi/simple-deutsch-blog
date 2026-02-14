import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { assertLocale } from "@/i18n/locale";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootLayout({ children, params }: Props) {
  const { locale } = await params;

  try {
    assertLocale(locale);
    return (
      <>
        <div data-layout="root-locale" hidden />
        {children}
      </>
    );
  } catch {
    notFound();
  }
}
