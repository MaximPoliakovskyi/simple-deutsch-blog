// src/app/about/page.tsx

import Link from "next/link";
import { TRANSLATIONS, DEFAULT_LOCALE } from "@/core/i18n/i18n";

type Locale = "en" | "ua" | "ru" | "de";

export default function AboutPage({ locale }: { locale?: Locale }) {
  const lang = (locale as Locale) ?? DEFAULT_LOCALE;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t["about.platformLabel"]}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold text-[hsl(var(--fg))]">{t["about.title"]}</h1>
        <p className="mt-4 text-lg text-[hsl(var(--fg-muted))]">{t["about.intro"]}</p>
      </section>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">{t["about.whatWeBuild.title"]}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <article
                key={i}
                className="rounded-lg bg-white/80 dark:bg-white/5 border border-black/5 dark:border-white/5 p-5"
              >
                <h3 className="font-semibold mb-2 text-[hsl(var(--fg))]">{t[`about.what.${i}.title`]}</h3>
                <p className="text-sm text-[hsl(var(--fg-muted))]">{t[`about.what.${i}.desc`]}</p>
              </article>
            ))}
          </div>
        </section>

        <aside>
          <h2 className="text-2xl font-semibold mb-4">{t["about.principles.title"]}</h2>
          <ul className="list-disc pl-5 space-y-2 text-[hsl(var(--fg-muted))]">
            <li>{t["about.principle.clarity"]}</li>
            <li>{t["about.principle.practicality"]}</li>
            <li>{t["about.principle.consistency"]}</li>
            <li>{t["about.principle.accessibility"]}</li>
          </ul>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">{t["about.quickOverview.title"]}</h3>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-md bg-white/80 dark:bg-white/5 p-2 px-3 border border-black/5 dark:border-white/5 text-sm">
                {t["about.quick.levels"]}
              </div>
              <div className="rounded-md bg-white/80 dark:bg-white/5 p-2 px-3 border border-black/5 dark:border-white/5 text-sm">
                {t["about.quick.languages"]}
              </div>
              <div className="rounded-md bg-white/80 dark:bg-white/5 p-2 px-3 border border-black/5 dark:border-white/5 text-sm">
                {t["about.quick.contentTypes"]}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-12 border-t border-black/5 dark:border-white/5 pt-8 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/levels" className="sd-pill px-6 py-2">
            {t["about.cta.levels"]}
          </Link>
          <Link href="/posts" className="sd-pill px-6 py-2">
            {t["about.cta.posts"]}
          </Link>
        </div>
      </div>
    </main>
  );
}
