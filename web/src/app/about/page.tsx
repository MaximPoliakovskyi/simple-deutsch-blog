// src/app/about/page.tsx

import AboutPage from "@/components/pages/about/AboutPage";

type Locale = "en" | "ua" | "ru" | "de";

export default function AboutPageWrapper(_props: { locale?: Locale }) {
  return <AboutPage />;
}
