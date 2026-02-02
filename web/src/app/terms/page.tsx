import React from "react";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";
import type { Locale } from "@/i18n/locale";

export default function TermsPage({ locale }: { locale?: Locale }) {
  const lang = (locale as Locale) ?? DEFAULT_LOCALE;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];

  const renderList = (key: string) => {
    const raw = t[key] || "";
    const items = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!items.length) return null;
    return (
      <ul className="list-disc pl-6 space-y-2 text-[hsl(var(--fg-muted))]">
        {items.map((it) => {
          const clean = it.replace(/^[-\s]+/, "");
          return <li key={clean}>{clean}</li>;
        })}
      </ul>
    );
  };

  const lastUpdated = (t["terms.lastUpdated"] || "{label}: {date}")
    .replace("{label}", t["terms.lastUpdatedLabel"] || "Last updated")
    .replace("{date}", t["terms.lastUpdatedDate"] || "2025-12-25");

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>{t["terms.title"]}</h1>
        <p className="text-sm text-muted-foreground">{lastUpdated}</p>

        <p>{t["terms.s1.p"]}</p>

        <h2>{t["terms.s2.title"]}</h2>
        <p>{t["terms.s2.p"]}</p>

        <h2>{t["terms.s3.title"]}</h2>
        <p>{t["terms.s3.p"]}</p>

        <h2>{t["terms.s4.title"]}</h2>
        {renderList("terms.s4.p") || <p>{t["terms.s4.p"]}</p>}

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
        <p>
          {t["terms.s11.p"]}{" "}
          <a className="text-blue-600 dark:text-blue-400" href="mailto:hello@simpledeutsch.com">
            hello@simpledeutsch.com
          </a>
        </p>
      </div>
    </main>
  );
}
