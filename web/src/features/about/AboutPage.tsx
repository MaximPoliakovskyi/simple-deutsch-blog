import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import ScrollRotateLogo from "@/features/about/ScrollRotateLogo";
import SectionText from "@/features/about/SectionText";
import { getTranslations, type TranslationKey } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";

type AboutPageProps = {
  locale?: Locale;
};

type AboutMediaProps = {
  alt?: string;
  src?: string;
};

type TestimonialCardProps = {
  children: ReactNode;
  name: string;
  role?: string;
};

function AboutMedia({ src, alt }: AboutMediaProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      {src ? (
        <div className="aspect-video overflow-hidden rounded-2xl bg-[var(--sd-surface-soft)]">
          <Image
            src={src}
            alt={alt ?? ""}
            width={1152}
            height={648}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-video w-full rounded-2xl bg-[var(--sd-image-placeholder)]" />
      )}
    </div>
  );
}

function TestimonialCard({ name, role, children }: TestimonialCardProps) {
  return (
    <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-4">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[var(--sd-image-placeholder)]">
          <Image
            src="/placeholder.webp"
            alt={name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="font-semibold text-white">{name}</div>
          {role ? <div className="text-sm text-gray-300">{role}</div> : null}
        </div>
      </div>

      <p className="text-lg leading-relaxed text-white">{children}</p>
    </article>
  );
}

export default function AboutPage({ locale = DEFAULT_LOCALE }: AboutPageProps) {
  const dict = getTranslations(locale);
  const t = (key: TranslationKey) => dict[key];

  return (
    <main className="min-h-[70vh] bg-[var(--sd-page-bg)] text-[var(--sd-text)]">
      <section className="mx-auto max-w-7xl px-4 pt-24 text-center">
        <div className="logo-wrapper mb-8 flex justify-center">
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

        <div className="mx-auto w-full max-w-[75rem] px-4">
          <h1 className="mb-8 text-center text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--sd-text)] sm:text-5xl md:text-6xl">
            <span className="block">{t("about.hero.title")}</span>
            <span className="block">{t("about.hero.subtitle")}</span>
          </h1>
        </div>

        <SectionText>
          <p className="mx-auto mt-0 max-w-[58rem] text-center text-base leading-relaxed text-[var(--sd-text-muted)] sm:text-lg md:text-xl">
            {t("about.hero.description")}
          </p>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-20 md:pt-28">
        <div className="flex flex-col items-center space-y-16 md:space-y-20">
          <SectionText title={t("about.sections.realLife.title")}>
            <div className="space-y-4 text-lg leading-relaxed text-[var(--sd-text-muted)]">
              <p className="text-center md:text-left">{t("about.sections.realLife.p1")}</p>
              <p className="text-center md:text-left">{t("about.sections.realLife.p2")}</p>
              <p className="text-center md:text-left">{t("about.sections.realLife.p3")}</p>
            </div>
          </SectionText>

          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />

          <SectionText title={t("about.sections.consistency.title")}>
            <div className="space-y-6 text-lg leading-[1.6] text-[var(--sd-text-muted)] md:text-xl">
              <p className="text-center md:text-left">{t("about.sections.consistency.p1")}</p>
              <p className="text-center md:text-left">{t("about.sections.consistency.p2")}</p>
              <p className="text-center md:text-left">{t("about.sections.consistency.p3")}</p>
              <p className="text-center md:text-left">{t("about.sections.consistency.p4")}</p>

              <blockquote className="mx-auto my-10 border-l-2 border-[var(--sd-border)] pl-4 text-xl italic text-[var(--sd-text-muted)] md:pl-6">
                {t("about.sections.consistency.quote")}
              </blockquote>

              <p className="text-center md:text-left">{t("about.sections.consistency.p5")}</p>
            </div>
          </SectionText>

          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-20">
        <SectionText title={t("about.sections.fits.title")}>
          <div className="space-y-6 text-lg leading-relaxed text-[var(--sd-text-muted)]">
            <p className="text-center md:text-left">{t("about.sections.fits.p1")}</p>
            <p className="text-center md:text-left">{t("about.sections.fits.p2")}</p>
          </div>
        </SectionText>
      </section>

      <section className="w-full bg-[#0B0D16] py-16 md:py-24">
        <div className="dark sd-dark-scope">
          <div className="mx-auto w-full max-w-7xl px-4">
            <div className="mx-auto mb-6 max-w-3xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                {t("about.testimonials.heading")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-300 md:text-lg">
                {t("about.testimonials.sub")}
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-14 md:grid-cols-3 md:gap-8">
              <TestimonialCard
                name={t("about.testimonials.1.name")}
                role={t("about.testimonials.1.role")}
              >
                {t("about.testimonials.1.text")}
              </TestimonialCard>

              <TestimonialCard
                name={t("about.testimonials.2.name")}
                role={t("about.testimonials.2.role")}
              >
                {t("about.testimonials.2.text")}
              </TestimonialCard>

              <TestimonialCard
                name={t("about.testimonials.3.name")}
                role={t("about.testimonials.3.role")}
              >
                {t("about.testimonials.3.text")}
              </TestimonialCard>

              <TestimonialCard
                name={t("about.testimonials.4.name")}
                role={t("about.testimonials.4.role")}
              >
                {t("about.testimonials.4.text")}
              </TestimonialCard>

              <TestimonialCard
                name={t("about.testimonials.5.name")}
                role={t("about.testimonials.5.role")}
              >
                {t("about.testimonials.5.text")}
              </TestimonialCard>

              <TestimonialCard
                name={t("about.testimonials.6.name")}
                role={t("about.testimonials.6.role")}
              >
                {t("about.testimonials.6.text")}
              </TestimonialCard>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-28 md:py-32">
        <SectionText
          title={
            <h2 className="text-3xl font-semibold text-[var(--sd-text)] sm:text-4xl">
              {t("about.cta.finalTitle")}
            </h2>
          }
        >
          <p className="mx-auto mb-8 max-w-[58rem] text-center text-base leading-relaxed text-[var(--sd-text-muted)] sm:text-lg md:text-xl">
            {t("about.cta.finalLead")}
          </p>

          <div className="mt-0 flex justify-center">
            <Link
              href={buildLocalizedHref(locale, "/posts")}
              className="sd-pill mx-auto rounded-full px-5 py-2 text-sm font-medium shadow-md transition duration-200 ease-out hover:shadow-lg"
              aria-label={t("about.cta.finalCta")}
            >
              {t("about.cta.finalCta")}
            </Link>
          </div>
        </SectionText>
      </section>
    </main>
  );
}
