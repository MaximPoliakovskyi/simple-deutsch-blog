import { DEFAULT_LOCALE } from "@/lib/i18n";
import HomePage from "../../[locale]/home-page";

export default function StartFallbackPage() {
  return <HomePage locale={DEFAULT_LOCALE} />;
}
