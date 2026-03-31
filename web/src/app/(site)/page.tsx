import type { Metadata } from "next";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import HomePage from "../[locale]/home-page";

export const metadata: Metadata = {
  description: TRANSLATIONS[DEFAULT_LOCALE].heroDescription,
  title: TRANSLATIONS[DEFAULT_LOCALE].siteTitle,
};

export default function Page() {
  return <HomePage locale={DEFAULT_LOCALE} />;
}
