import { DEFAULT_LOCALE } from "@/lib/i18n";
import PrivacyPage from "../../[locale]/privacy/privacy-page";

export default function PrivacyRoute() {
  return <PrivacyPage locale={DEFAULT_LOCALE} />;
}
