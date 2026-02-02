// src/app/about/page.tsx

import AboutPage from "@/components/pages/about/AboutPage";

import type { Locale } from "@/i18n/locale";

export default function AboutPageWrapper(_props: { locale?: Locale }) {
  return <AboutPage />;
}
