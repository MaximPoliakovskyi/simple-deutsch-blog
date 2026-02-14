import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "@/components/layout/Footer";
import SiteChrome from "@/components/layout/SiteChrome";
import Providers from "@/components/Providers";
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
    const validated = assertLocale(locale);
    return (
      <SiteChrome>
        <div data-layout="site" hidden />
        <Providers>
          <main className="mt-8 md:mt-12 min-h-[60vh]">{children}</main>
          <Footer locale={validated} />
        </Providers>
      </SiteChrome>
    );
  } catch (_e) {
    notFound();
  }
}
