import Image from "next/image";
import Link from "next/link";
import { buildLocalizedHref, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import ScrollRotateLogo from "./about-scroll-rotate-logo";
import SectionText from "./about-section-text";

type AboutPageProps = {
  locale?: Locale;
};

const P_CLASS = "text-left whitespace-pre-line";

function renderTextSection(text: string) {
  if (!text) return null;
  const splitIdx = text.indexOf("\n\n");
  if (splitIdx !== -1) {
    const before = text.slice(0, splitIdx).trim();
    const after = text.slice(splitIdx + 2);
    // Label + structured list (before ends with ":")
    if (before.endsWith(":")) {
      const items = after.split("\n").filter(Boolean);
      return (
        <div>
          <p className="text-[var(--sd-text)]">{before}</p>
          <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="shrink-0 min-w-[1rem] opacity-40 select-none">–</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // Multi-paragraph: split on double newline
    return (
      <>
        {text.split("\n\n").filter(Boolean).map((para, i) => (
          <p key={i} className={P_CLASS}>{para.trim()}</p>
        ))}
      </>
    );
  }
  return <p className={P_CLASS}>{text}</p>;
}

export default function AboutPage({ locale = DEFAULT_LOCALE }: AboutPageProps) {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const t = (key: string) => dict[key] ?? "";

  return (
    <main className="sd-fade-in-slow min-h-[70vh] bg-[var(--sd-page-bg)] text-[var(--sd-text)]">
      <section className="mx-auto max-w-7xl px-4 pt-20 md:pt-24 pb-6 md:pb-8 text-center">
        <div className="logo-wrapper flex justify-center mb-8">
          <ScrollRotateLogo degPerPx={0.15} clamp={360}>
            <Image
              src="/main-logo.svg"
              alt={t("about.logo.alt")}
              width={220}
              height={64}
              className="object-contain"
            />
          </ScrollRotateLogo>
        </div>

        <div className="w-full max-w-300 mx-auto px-4">
          <h1 className="type-display mb-8 text-[var(--sd-text)] text-center">
            <span className="block">{t("about.hero.title")}</span>
            <span className="block">{t("about.hero.subtitle")}</span>
          </h1>
        </div>

        <SectionText>
          <div className="type-lead mt-0 max-w-232 mx-auto text-left text-[var(--sd-text-muted)] space-y-4">
            {(t("about.hero.description") || "").split("\n\n").filter(Boolean).map((para, i) => (
              <p key={i} className="whitespace-pre-line">{para.trim()}</p>
            ))}
          </div>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-10 md:pt-16">
        <div className="flex flex-col items-center space-y-14 md:space-y-20">
          <SectionText title={t("about.sections.realLife.title")}>
            <div className="space-y-5 sm:space-y-6 text-base sm:text-lg leading-[1.65] sm:leading-[1.78] text-[var(--sd-text-muted)]">
              {renderTextSection(t("about.sections.realLife.p1"))}
              {renderTextSection(t("about.sections.realLife.p2"))}
              {renderTextSection(t("about.sections.realLife.p3"))}
            </div>
          </SectionText>

          <SectionText title={t("about.sections.consistency.title")}>
            <div className="space-y-5 sm:space-y-6 text-base sm:text-lg leading-[1.65] sm:leading-[1.78] text-[var(--sd-text-muted)]">
              {renderTextSection(t("about.sections.consistency.p1"))}
              {renderTextSection(t("about.sections.consistency.p2"))}
              {renderTextSection(t("about.sections.consistency.p3"))}
              {renderTextSection(t("about.sections.consistency.p4"))}
              {t("about.sections.consistency.quote") ? (
                <blockquote className="mx-auto my-6 border-l-2 border-[var(--sd-border)] pl-4 text-lg italic leading-[1.7] text-[var(--sd-text-muted)] md:pl-6">
                  {t("about.sections.consistency.quote")}
                </blockquote>
              ) : null}
              {renderTextSection(t("about.sections.consistency.p5"))}
            </div>
          </SectionText>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
        <SectionText title={t("about.sections.fits.title")}>
          <div>
            <div className="space-y-3 sm:space-y-4 text-base sm:text-lg leading-[1.6] text-[var(--sd-text-muted)]">
              {renderTextSection(t("about.sections.fits.p1"))}
              {renderTextSection(t("about.sections.fits.p2"))}
              {renderTextSection(t("about.sections.fits.p3"))}
              {renderTextSection(t("about.sections.fits.p4"))}
            </div>
            {(t("about.sections.fits.p5") || t("about.sections.fits.p6")) ? (
              <div className="mt-5 sm:mt-6 space-y-1.5 sm:space-y-2 text-base sm:text-lg leading-[1.6] text-[var(--sd-text-muted)]">
                {renderTextSection(t("about.sections.fits.p5"))}
                {renderTextSection(t("about.sections.fits.p6"))}
              </div>
            ) : null}
          </div>
        </SectionText>
      </section>

      {/* Final CTA - encourages action, last section on page */}
      <section className="mx-auto w-full max-w-7xl px-4 py-14 md:py-20">
        <SectionText
          title={<h2 className="type-title text-[var(--sd-text)]">{t("about.cta.finalTitle")}</h2>}
        >
          <p className="type-lead mt-4 mb-5 max-w-232 mx-auto text-center text-[var(--sd-text-muted)]">
            {t("about.cta.finalLead")}
          </p>

          <div className="mt-0 flex justify-center">
            <Link
              href={buildLocalizedHref(locale, "/articles")}
              className="type-button mx-auto rounded-full px-5 py-2 transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg disabled:opacity-60 sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("about.cta.finalCta")}
            </Link>
          </div>
        </SectionText>
      </section>
    </main>
  );
}
