import React from "react";
import { DEFAULT_LOCALE, TRANSLATIONS } from "@/core/i18n/i18n";

type Locale = "en" | "uk" | "ru" | "de";

export default function PrivacyPage({ locale }: { locale?: Locale }) {
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
        {items.map((it, i) => (
          <li key={i}>{it.replace(/^[-\s]+/, "")}</li>
        ))}
      </ul>
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mx-auto max-w-3xl prose dark:prose-invert">
        <h1>{t["privacy.title"]}</h1>
        <p className="text-sm text-muted-foreground">
          {(t["privacy.lastUpdated"] || "").replace("{date}", "2025-12-25")}
        </p>

        <p>{t["privacy.s1.p"]}</p>

        <h2>{t["privacy.s2.title"]}</h2>
        <p>{t["privacy.s2.p"]}</p>

        <h2>{t["privacy.s3.title"]}</h2>
        <h3 className="text-base font-semibold">{t["privacy.s3.a.title"]}</h3>
        <p>{t["privacy.s3.a.p"]}</p>
        <h3 className="text-base font-semibold">{t["privacy.s3.b.title"]}</h3>
        <p>{t["privacy.s3.b.p"]}</p>
        <h3 className="text-base font-semibold">{t["privacy.s3.c.title"]}</h3>
        <p>{t["privacy.s3.c.p"]}</p>
        <h3 className="text-base font-semibold">{t["privacy.s3.d.title"]}</h3>
        <p>{t["privacy.s3.d.p"]}</p>

        <h2>{t["privacy.s4.title"]}</h2>
        <h3 className="text-base font-semibold">{t["privacy.s4.a.title"]}</h3>
        <p>{t["privacy.s4.a.p"]}</p>
        <h3 className="text-base font-semibold">{t["privacy.s4.b.title"]}</h3>
        <p>{t["privacy.s4.b.p"]}</p>
        <h3 className="text-base font-semibold">{t["privacy.s4.c.title"]}</h3>
        <p>{t["privacy.s4.c.p"]}</p>

        <h2>{t["privacy.s5.title"]}</h2>
        {renderList("privacy.s5.p")}

        <h2>{t["privacy.s6.title"]}</h2>
        {renderList("privacy.s6.p")}

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
        <p>
          {t["privacy.s13.p"]}{" "}
          <a className="text-blue-600 dark:text-blue-400" href="mailto:hello@simpledeutsch.com">
            hello@simpledeutsch.com
          </a>
        </p>
      </div>
    </main>
  );
}
