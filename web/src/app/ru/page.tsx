// src/app/ru/page.tsx
// Russian root route (renders the same homepage server component)
import HomePage from "../page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ru"].siteTitle}`,
};

export default async function RuHome() {
  return <HomePage locale="ru" />;
}
