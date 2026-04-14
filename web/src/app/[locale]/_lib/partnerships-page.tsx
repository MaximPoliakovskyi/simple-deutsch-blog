import Image from "next/image";
import { DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";
import SectionText from "./about-section-text";

type PartnershipsClientProps = {
  contactEmail: string;
  locale?: Locale;
};

const TELEGRAM_LINK = "https://t.me/Maximiliian";

type ThemeAwareLogoProps = {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  width: number;
  height: number;
  className: string;
};

function ThemeAwareLogo({ lightSrc, darkSrc, alt, width, height, className }: ThemeAwareLogoProps) {
  return (
    <>
      <Image
        src={lightSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} dark:hidden`}
      />
      <Image
        src={darkSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} hidden dark:block`}
      />
    </>
  );
}

function renderBlock(text: string) {
  if (!text) return null;
  const splitIdx = text.indexOf("\n\n");
  if (splitIdx === -1) {
    return <p>{text}</p>;
  }
  const label = text.slice(0, splitIdx);
  const items = text.slice(splitIdx + 2).split("\n").filter(Boolean);
  return (
    <div className="pt-2 sm:pt-3">
      <p className="text-[var(--sd-text)]">{label}</p>
      <div className="mt-3 space-y-2 sm:space-y-2.5">
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

export default function PartnershipsClient({
  contactEmail,
  locale = DEFAULT_LOCALE,
}: PartnershipsClientProps) {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const t = (key: string) => dict[key] ?? key;

  return (
    <main className="sd-fade-in-slow min-h-[70vh] bg-[var(--sd-page-bg)] text-[var(--sd-text)]">
      <section className="mx-auto max-w-7xl px-4 pt-24 text-center">
        <SectionText
          title={
            <h1 className="type-display sd-fade-in-item text-[var(--sd-text)] text-center">
              {t("partnerships.hero.title")}
            </h1>
          }
        >
          <div className="sd-fade-in-item text-left" style={{ animationDelay: "90ms" }}>
            <p className="type-lead text-[var(--sd-text-muted)]">{t("partnerships.hero.intro")}</p>
          </div>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pt-8 md:pt-10 mb-28">
        <SectionText>
          <div
            className="sd-fade-in-item mx-auto w-full max-w-[72ch] space-y-4 sm:space-y-6 text-left text-base sm:text-lg leading-[1.65] sm:leading-[1.78] text-[var(--sd-text-muted)]"
            style={{ animationDelay: "180ms" }}
          >
            {renderBlock(t("partnerships.sections.preLogos.p1"))}
            {renderBlock(t("partnerships.sections.preLogos.p2"))}
            {renderBlock(t("partnerships.sections.preLogos.p3"))}
          </div>
        </SectionText>
      </section>

      <div className="bg-gradient-section -mx-[calc(50vw-50%)] w-screen">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="type-title sd-fade-in-item text-center text-[var(--sd-text)]">
            {t("partnerships.partners.heading")}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center justify-items-center gap-16 pt-8 sm:gap-24">
            <a
              href="https://la-red.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="sd-fade-in-item group block cursor-pointer"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/la-red-logo.webp"
                  alt="La Red"
                  width={900}
                  height={300}
                  className="max-h-28 md:max-h-32 w-auto max-w-[380px] object-contain opacity-80 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://www.deutschlandstiftung.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="sd-fade-in-item group block cursor-pointer"
              style={{ animationDelay: "160ms" }}
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <ThemeAwareLogo
                  lightSrc="/partnerships_logo/DSI_logo.png"
                  darkSrc="/partnerships_logo/DSI_white_logo.png"
                  alt="Deutschlandstiftung Integration (DSI)"
                  width={1100}
                  height={600}
                  className="max-h-32 md:max-h-36 w-auto max-w-[480px] object-contain opacity-80 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://www.deutschlandstiftung.net/projekte/fast-track"
              target="_blank"
              rel="noopener noreferrer"
              className="sd-fade-in-item group block cursor-pointer"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <ThemeAwareLogo
                  lightSrc="/partnerships_logo/fast_track_logo.png"
                  darkSrc="/partnerships_logo/fast_track_white_logo.png"
                  alt="Fast Track"
                  width={900}
                  height={400}
                  className="max-h-28 md:max-h-32 w-auto object-contain opacity-80 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                />
              </div>
            </a>

            <a
              href="https://la-red.eu/projekt/nex-ki"
              target="_blank"
              rel="noopener noreferrer"
              className="sd-fade-in-item group block cursor-pointer"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex h-40 w-full max-w-[420px] items-center justify-center">
                <Image
                  src="/partnerships_logo/NexKI_logo.png"
                  alt="NexKI"
                  width={900}
                  height={400}
                  className="max-h-28 md:max-h-32 w-auto object-contain opacity-80 transition duration-300 group-hover:opacity-100 motion-reduce:transition-none dark:brightness-125"
                />
              </div>
            </a>
          </div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 mt-28 pb-20 md:pb-24">
        <SectionText>
          <div className="sd-fade-in-item mx-auto w-full max-w-[72ch] space-y-4 sm:space-y-6 text-left text-base sm:text-lg leading-[1.65] sm:leading-[1.78] text-[var(--sd-text-muted)]">
            {renderBlock(t("partnerships.sections.postLogos.p1"))}
            {renderBlock(t("partnerships.sections.postLogos.p2"))}
            {renderBlock(t("partnerships.sections.postLogos.p3"))}
            {renderBlock(t("partnerships.sections.postLogos.p4"))}
            {renderBlock(t("partnerships.sections.postLogos.p5"))}
          </div>
        </SectionText>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-28 md:pb-32">
        <SectionText
          className="[&>div>div]:space-y-3 md:[&>div>div]:space-y-3"
          title={
            <h2 className="type-title sd-fade-in-item text-[var(--sd-text)] text-center">
              {t("partnerships.cta.title")}
            </h2>
          }
        >
          <div className="sd-fade-in-item text-center" style={{ animationDelay: "80ms" }}>
            <p className="type-lead text-[var(--sd-text-muted)]">{t("partnerships.cta.lead")}</p>
          </div>

          <div
            className="sd-fade-in-item flex flex-wrap items-center justify-center gap-3 pt-2"
            style={{ animationDelay: "160ms" }}
          >
            <a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="type-button rounded-full px-5 py-2 transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("partnerships.cta.telegram")}
            </a>

            <a
              href={`mailto:${contactEmail}`}
              className="type-button rounded-full px-5 py-2 transition duration-200 ease-out transform-gpu hover:scale-[1.03] motion-reduce:transform-none shadow-md hover:shadow-lg sd-pill focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {t("partnerships.cta.email")}
            </a>
          </div>
        </SectionText>
      </section>
    </main>
  );
}
