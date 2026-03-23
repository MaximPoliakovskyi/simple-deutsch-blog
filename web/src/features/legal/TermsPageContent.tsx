import { getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import LegalPageLayout, {
  getLegalLastUpdated,
  inlineContact,
  renderLegalList,
} from "./LegalPageLayout";

type LegalPageProps = {
  locale?: Locale;
};

export default function TermsPageContent({ locale = DEFAULT_LOCALE }: LegalPageProps) {
  const t = getTranslations(locale);

  return (
    <LegalPageLayout lastUpdated={getLegalLastUpdated("terms", locale, t)} title={t["terms.title"]}>
      <p>{t["terms.s1.p"]}</p>

      <h2>{t["terms.s2.title"]}</h2>
      <p>{t["terms.s2.p"]}</p>

      <h2>{t["terms.s3.title"]}</h2>
      <p>{t["terms.s3.p"]}</p>

      <h2>{t["terms.s4.title"]}</h2>
      {renderLegalList(t["terms.s4.p"]) || <p>{t["terms.s4.p"]}</p>}

      <h2>{t["terms.s5.title"]}</h2>
      <p>{t["terms.s5.p"]}</p>

      <h2>{t["terms.s6.title"]}</h2>
      <p>{t["terms.s6.p"]}</p>

      <h2>{t["terms.s7.title"]}</h2>
      <p>{t["terms.s7.p"]}</p>

      <h2>{t["terms.s8.title"]}</h2>
      <p>{t["terms.s8.p"]}</p>

      <h2>{t["terms.s9.title"]}</h2>
      <p>{t["terms.s9.p"]}</p>

      <h2>{t["terms.s10.title"]}</h2>
      <p>{t["terms.s10.p"]}</p>

      <h2>{t["terms.s11.title"]}</h2>
      {inlineContact("hello@simpledeutsch.com", t["terms.s11.p"])}
    </LegalPageLayout>
  );
}
