import { DEFAULT_LOCALE } from "@/lib/i18n";
import TermsPage from "../../[locale]/terms/terms-page";

export default function TermsRoute() {
  return <TermsPage locale={DEFAULT_LOCALE} />;
}
