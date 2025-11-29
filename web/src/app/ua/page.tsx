// src/app/ua/page.tsx
// Ukrainian root route (renders the same homepage server component)
import HomePage from "../page";
import { TRANSLATIONS } from "@/lib/i18n";

export const metadata = {
  title: `${TRANSLATIONS["ua"].siteTitle}`,
};

export default async function UaHome() {
  return <HomePage locale="ua" />;
}
