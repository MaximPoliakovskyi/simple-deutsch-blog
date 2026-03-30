import type { Metadata } from "next";
import HomePage from "@/components/pages/HomePageServer";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export const metadata: Metadata = {
  title: TRANSLATIONS[DEFAULT_LOCALE].siteTitle,
  description: TRANSLATIONS[DEFAULT_LOCALE].heroDescription,
};

export default function Page() {
  // Proxy is the source of truth for locale redirects.
  // If proxy is bypassed in some environments, render default locale content.
  return (
    <main data-testid="home-marker-fallback">
      <HomePage locale={DEFAULT_LOCALE} />
    </main>
  );
}
