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

export default function PrivacyPageContent({ locale = DEFAULT_LOCALE }: LegalPageProps) {
  const t = getTranslations(locale);

  return (
    <LegalPageLayout
      lastUpdated={getLegalLastUpdated("privacy", locale, t)}
      title={t["privacy.title"]}
    >
      <p>{t["privacy.s1.p"]}</p>

      <h2>{t["privacy.s2.title"]}</h2>
      <p>{t["privacy.s2.p"]}</p>

      <h2>{t["privacy.s3.title"]}</h2>
      <h3>{t["privacy.s3.a.title"]}</h3>
      <p>{t["privacy.s3.a.p"]}</p>
      <h3>{t["privacy.s3.b.title"]}</h3>
      <p>{t["privacy.s3.b.p"]}</p>
      <h3>{t["privacy.s3.c.title"]}</h3>
      <p>{t["privacy.s3.c.p"]}</p>
      <h3>{t["privacy.s3.d.title"]}</h3>
      <p>{t["privacy.s3.d.p"]}</p>

      <h2>{t["privacy.s4.title"]}</h2>
      <h3>{t["privacy.s4.a.title"]}</h3>
      <p>{t["privacy.s4.a.p"]}</p>
      <h3>{t["privacy.s4.b.title"]}</h3>
      <p>{t["privacy.s4.b.p"]}</p>
      <h3>{t["privacy.s4.c.title"]}</h3>
      <p>{t["privacy.s4.c.p"]}</p>

      <h2>{t["privacy.s5.title"]}</h2>
      {renderLegalList(t["privacy.s5.p"])}

      <h2>{t["privacy.s6.title"]}</h2>
      {renderLegalList(t["privacy.s6.p"])}

      <h2>{t["privacy.s7.title"]}</h2>
      <p>{t["privacy.s7.p"]}</p>

      <h2>{t["privacy.s8.title"]}</h2>
      <p>{t["privacy.s8.p"]}</p>

      <h2>{t["privacy.s9.title"]}</h2>
      <p>{t["privacy.s9.p"]}</p>

      <h2>{t["privacy.s10.title"]}</h2>
      <p>{t["privacy.s10.p"]}</p>

      <h2>{t["privacy.s11.title"]}</h2>
      <p>{t["privacy.s11.p"]}</p>

      <h2>{t["privacy.s12.title"]}</h2>
      <p>{t["privacy.s12.p"]}</p>

      <h2>{t["privacy.s13.title"]}</h2>
      {inlineContact("hello@simpledeutsch.com", t["privacy.s13.p"])}
    </LegalPageLayout>
  );
}
