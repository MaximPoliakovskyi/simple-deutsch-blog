import Image from "next/image";
import Link from "next/link";
import { buildLocalizedHref, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import ScrollRotateLogo from "./about-scroll-rotate-logo";
import SectionText from "./about-section-text";

function AboutMedia({
  src,
  alt = "",
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div className="w-full max-w-232 mx-auto">
      {src ? (
        <div className={`aspect-video rounded-2xl overflow-hidden w-full ${className}`}>
          <Image
            src={src}
            alt={alt}
            width={928}
            height={Math.round((928 * 9) / 16)}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`aspect-video bg-neutral-200 dark:bg-white/10 rounded-2xl w-full ${className}`}
        />
      )}
    </div>
  );
}

type AboutPageProps = {
  locale?: Locale;
};

export default function AboutPage({ locale = DEFAULT_LOCALE }: AboutPageProps) {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const t = (key: string) => dict[key] ?? key;

  return (
    <main className="sd-fade-in-slow min-h-[70vh] bg-[var(--sd-page-bg)] text-[var(--sd-text)]">
      <section className="mx-auto max-w-7xl px-4 pt-24 text-center">
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
          <p className="type-lead mt-0 max-w-232 mx-auto text-center text-[var(--sd-text-muted)]">
            {t("about.hero.description")}
          </p>
        </SectionText>
      </section>

      {/* Editorial content flow: vertical sequence (text -> image) x3 */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 md:pt-28">
        <div className="flex flex-col items-center space-y-16 md:space-y-20">
          {/* 1) Text block */}
          <SectionText title={t("about.sections.realLife.title")}>
            <div className="space-y-4 text-base sm:text-lg leading-[1.78] text-[var(--sd-text-muted)]">
              <p className="md:text-left text-center">{t("about.sections.realLife.p1")}</p>
              <p className="md:text-left text-center">{t("about.sections.realLife.p2")}</p>
              <p className="md:text-left text-center">{t("about.sections.realLife.p3")}</p>
            </div>
          </SectionText>

          {/* 2) Pseudo-image */}
          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />

          {/* 5) Text block */}
          <SectionText title={t("about.sections.consistency.title")}>
            <div className="space-y-6 text-base sm:text-lg leading-[1.78] text-[var(--sd-text-muted)] hyphens-auto wrap-break-word">
              <p className="md:text-left text-center">{t("about.sections.consistency.p1")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p2")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p3")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p4")}</p>

              <blockquote className="mx-auto my-10 border-l-2 border-[var(--sd-border)] pl-4 text-lg italic leading-[1.7] text-[var(--sd-text-muted)] md:pl-6">
                {t("about.sections.consistency.quote")}
              </blockquote>

              <p className="md:text-left text-center">{t("about.sections.consistency.p5")}</p>
            </div>
          </SectionText>

          {/* 6) Pseudo-image */}
          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />
        </div>
      </section>
      {/* Intermediate text section: separates editorial visuals from testimonials */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
        <SectionText title={t("about.sections.fits.title")}>
          <div className="space-y-6 text-base sm:text-lg leading-[1.78] text-[var(--sd-text-muted)]">
            <p className="md:text-left text-center">{t("about.sections.fits.p1")}</p>
            <p className="md:text-left text-center">{t("about.sections.fits.p2")}</p>
          </div>
        </SectionText>
      </section>

      {/* Final CTA - encourages action, last section on page */}
      <section className="mx-auto w-full max-w-7xl px-4 py-28 md:py-32">
        <SectionText
          title={<h2 className="type-title text-[var(--sd-text)]">{t("about.cta.finalTitle")}</h2>}
        >
          <p className="type-lead mt-6 mb-8 max-w-232 mx-auto text-center text-[var(--sd-text-muted)]">
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
