import { DEFAULT_LOCALE } from "@/lib/i18n";
import ImprintPage from "../../[locale]/imprint/imprint-page";

export default function ImprintRoute() {
  return <ImprintPage locale={DEFAULT_LOCALE} />;
}
