import HomePage from "@/components/pages/HomePageServer";
import { DEFAULT_LOCALE } from "@/i18n/locale";

export default function StartFallbackPage() {
  // Proxy is the source of truth for locale entry redirects.
  // This fallback renders only when proxy is bypassed.
  return (
    <main data-testid="start-marker-fallback">
      <HomePage locale={DEFAULT_LOCALE} />
    </main>
  );
}
