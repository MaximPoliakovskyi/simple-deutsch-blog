import type { Metadata } from "next";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/lib/i18n";
import PartnershipsClient from "../../[locale]/partnerships/partnerships-page";

const CONTACT_EMAIL = "partnerships@simple-deutsch.de";
const en = TRANSLATIONS[DEFAULT_LOCALE];

export const metadata: Metadata = {
  description: en["partnerships.meta.description"],
  title: `${en["partnerships.meta.title"]} | ${en.siteTitle}`,
};

export default async function PartnershipsPageRoute() {
  return <PartnershipsClient contactEmail={CONTACT_EMAIL} locale={DEFAULT_LOCALE} />;
}
