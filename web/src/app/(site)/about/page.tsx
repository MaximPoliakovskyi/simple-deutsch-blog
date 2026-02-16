// src/app/about/page.tsx

import AboutPage from "@/components/pages/about/AboutPage";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function AboutPageRoute() {
  return <AboutPage locale={DEFAULT_LOCALE} />;
}
