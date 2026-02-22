import type { Metadata } from "next";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import PartnershipsClient from "./PartnershipsClient";

const CONTACT_EMAIL = "partnerships@simple-deutsch.de";
const en = TRANSLATIONS[DEFAULT_LOCALE];

export const metadata: Metadata = {
  title: `${en["partnerships.meta.title"]} | ${en.siteTitle}`,
  description: en["partnerships.meta.description"],
};

export default async function PartnershipsPageRoute() {
  return <PartnershipsClient contactEmail={CONTACT_EMAIL} locale={DEFAULT_LOCALE} />;
}
