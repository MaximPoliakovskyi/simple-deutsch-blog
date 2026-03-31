import { DEFAULT_LOCALE } from "@/lib/i18n";
import AboutPage from "../../[locale]/about/about-page";

export default function AboutPageRoute() {
  return <AboutPage locale={DEFAULT_LOCALE} />;
}
