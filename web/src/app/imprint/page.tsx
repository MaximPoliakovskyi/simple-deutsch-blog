import React from "react";
import { TRANSLATIONS, DEFAULT_LOCALE, type Locale } from "@/core/i18n/i18n";

export default function ImprintPage({ locale }: { locale?: Locale }) {
  const lang = (locale as Locale) ?? DEFAULT_LOCALE;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];

  const lastUpdated = (t["imprint.lastUpdated"] || "Last updated: {date}").replace(
    "{date}",
    t["imprint.lastUpdatedDate"] || "2025-12-27",
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>{t["imprint.title"]}</h1>
        <p className="text-sm">{lastUpdated}</p>

        <h2>{t["imprint.s1.title"]}</h2>
        <p>{t["imprint.s1.p"].split("\\n")[0]}</p>
        <p>
          {t["imprint.s1.p"].split("\\n").slice(1).map((ln, i) => (
            <React.Fragment key={i}>
              {ln}
              <br />
            </React.Fragment>
          ))}
        </p>

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
      </div>
    </main>
  );
}
