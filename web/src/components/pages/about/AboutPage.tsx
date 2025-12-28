"use client";

import Image from "next/image";
import Link from "next/link";
import SectionText from "@/components/about/SectionText";
import AboutMedia from "@/components/about/AboutMedia";
import TestimonialCard from "@/components/about/TestimonialCard";
import ScrollRotateLogo from "@/components/about/ScrollRotateLogo";
import { useI18n } from "@/core/i18n/LocaleProvider";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <main className="min-h-[70vh] bg-(--sd-page-bg) text-(--sd-text)">
      <section className="mx-auto max-w-6xl px-6 pt-24 text-center">
        <div className="logo-wrapper flex justify-center mb-8">
          <ScrollRotateLogo degPerPx={0.15} clamp={360}>
            <Image src="/main-logo.svg" alt={t("about.logo.alt")} width={220} height={64} className="object-contain" />
          </ScrollRotateLogo>
        </div>

        <div className="w-full max-w-300 mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-(--sd-text) mb-8 text-center">
            <span className="block">{t("about.hero.title")}</span>
            <span className="block">{t("about.hero.subtitle")}</span>
          </h1>
        </div>

        <SectionText>
          <p className="mt-0 text-base sm:text-lg md:text-xl leading-relaxed text-(--sd-text-muted) max-w-232 mx-auto text-center">{t("about.hero.description")}</p>
        </SectionText>
      </section>
      

      

      
      {/* Editorial content flow: vertical sequence (text → image) x3 */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-20 md:pt-28">
        <div className="flex flex-col items-center space-y-16 md:space-y-20">
          {/* 1) Text block */}
          <SectionText title={t("about.sections.realLife.title")}>
            <div className="space-y-4 text-lg leading-relaxed text-(--sd-text-muted)">
              <p className="md:text-left text-center">{t("about.sections.realLife.p1")}</p>
              <p className="md:text-left text-center">{t("about.sections.realLife.p2")}</p>
              <p className="md:text-left text-center">{t("about.sections.realLife.p3")}</p>
            </div>
          </SectionText>

          {/* 2) Pseudo-image */}
          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />

          {/* (Removed one content block and its image placeholder to reduce duplication) */}

          {/* 5) Text block */}
          <SectionText title={t("about.sections.consistency.title")}>
            <div className="space-y-6 text-lg md:text-xl leading-[1.6] text-(--sd-text-muted) hyphens-auto wrap-break-word">
              <p className="md:text-left text-center">{t("about.sections.consistency.p1")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p2")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p3")}</p>

              <p className="md:text-left text-center">{t("about.sections.consistency.p4")}</p>

              <blockquote className="mx-auto italic text-xl text-(--sd-text-muted) my-10 border-l-2 border-(--sd-border) pl-4 md:pl-6">{t("about.sections.consistency.quote")}</blockquote>

              <p className="md:text-left text-center">{t("about.sections.consistency.p5")}</p>
            </div>
          </SectionText>

          {/* 6) Pseudo-image */}
          <AboutMedia src="/placeholder.webp" alt={t("about.media.placeholderAlt")} />
        </div>
      </section>
      {/* Intermediate text section: separates editorial visuals from testimonials */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20">
        <SectionText title={t("about.sections.fits.title")}>
          <div className="space-y-6 text-lg leading-relaxed text-(--sd-text-muted)">
            <p className="md:text-left text-center">{t("about.sections.fits.p1")}</p>
            <p className="md:text-left text-center">{t("about.sections.fits.p2")}</p>
          </div>
        </SectionText>
      </section>

      {/* Testimonials section (moved to page end) */}
      <section className="w-full bg-[#0B0D16] py-16 md:py-24">
        {/* Force-dark scope: local dark class ensures `dark:` utilities apply here */}
        <div className="dark sd-dark-scope">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="text-center mx-auto max-w-3xl mb-6">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">{t("about.testimonials.heading")}</h2>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-gray-300 max-w-2xl mx-auto">{t("about.testimonials.sub")}</p>
            </div>

            <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              <TestimonialCard name={t("about.testimonials.1.name")} role={t("about.testimonials.1.role")}>{t("about.testimonials.1.text")}</TestimonialCard>

              <TestimonialCard name={t("about.testimonials.2.name")} role={t("about.testimonials.2.role")}>{t("about.testimonials.2.text")}</TestimonialCard>

              <TestimonialCard name={t("about.testimonials.3.name")} role={t("about.testimonials.3.role")}>{t("about.testimonials.3.text")}</TestimonialCard>

              <TestimonialCard name={t("about.testimonials.4.name")} role={t("about.testimonials.4.role")}>{t("about.testimonials.4.text")}</TestimonialCard>

              <TestimonialCard name={t("about.testimonials.5.name")} role={t("about.testimonials.5.role")}>{t("about.testimonials.5.text")}</TestimonialCard>

              <TestimonialCard name={t("about.testimonials.6.name")} role={t("about.testimonials.6.role")}>{t("about.testimonials.6.text")}</TestimonialCard>
            </div>
          </div>
        </div>
      </section>
      {/* Final CTA — encourages action, last section on page */}
      <section className="mx-auto w-full max-w-6xl px-6 py-28 md:py-32">
        <SectionText title={<h2 className="text-3xl sm:text-4xl font-semibold text-(--sd-text)">{t("about.cta.finalTitle")}</h2>}>
          <p className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-(--sd-text-muted) max-w-232 mx-auto text-center mb-8">{t("about.cta.finalLead")}</p>

          <div className="mt-0 flex justify-center">
            <Link
              href="/posts"
              className="mx-auto rounded-full px-5 py-2 text-sm font-medium transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg disabled:opacity-60 sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
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
