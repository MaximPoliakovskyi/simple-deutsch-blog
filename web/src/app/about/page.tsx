// src/app/about/page.tsx

import AboutPage from "@/components/pages/about/AboutPage";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";

export default function AboutPageWrapper({ locale }: { locale?: Locale }) {
  return <AboutPage locale={locale ?? DEFAULT_LOCALE} />;
}
