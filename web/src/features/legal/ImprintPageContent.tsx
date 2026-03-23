import { getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import LegalPageLayout, { getLegalLastUpdated, renderLegalParagraphs } from "./LegalPageLayout";

type LegalPageProps = {
  locale?: Locale;
};

export default function ImprintPageContent({ locale = DEFAULT_LOCALE }: LegalPageProps) {
  const t = getTranslations(locale);

  return (
    <LegalPageLayout
      lastUpdated={getLegalLastUpdated("imprint", locale, t)}
      title={t["imprint.title"]}
    >
      <h2>{t["imprint.s1.title"]}</h2>
      {renderLegalParagraphs(t["imprint.s1.p"])}

      <h2>{t["imprint.s2.title"]}</h2>
      <p>{t["imprint.s2.p"]}</p>

      <h2>{t["imprint.s3.title"]}</h2>
      <p>{t["imprint.s3.intro"]}</p>
      <p>
        {t["imprint.s3.name"]}
        <br />
        {t["imprint.s3.address"]}
      </p>

      <h2>{t["imprint.s4.title"]}</h2>
      <p>{t["imprint.s4.p"]}</p>

      <h2>{t["imprint.s5.title"]}</h2>
      <p>{t["imprint.s5.p"]}</p>

      <h2>{t["imprint.s6.title"]}</h2>
      <p>{t["imprint.s6.p"]}</p>

      <h2>{t["imprint.s7.title"]}</h2>
      <p>{t["imprint.s7.p"]}</p>
    </LegalPageLayout>
  );
}
