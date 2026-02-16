import HomePage from "@/components/pages/HomePageServer";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function Page() {
  // Proxy is the source of truth for locale redirects.
  // If proxy is bypassed in some environments, render default locale content.
  return (
    <main data-testid="home-marker-fallback">
      <HomePage locale={DEFAULT_LOCALE} />
    </main>
  );
}
