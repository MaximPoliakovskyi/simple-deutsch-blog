import Link from "next/link";
import CookieSettingsButton from "@/components/cookie-settings-button";
import { buildLocalizedHref, DEFAULT_LOCALE, type Locale, TRANSLATIONS } from "@/lib/i18n";

const TYPO_STYLE = {
  fontSize: "var(--text-base)",
  lineHeight: "var(--tw-leading, var(--text-base--line-height))",
};

type LinkItem = { label: string; href: string; external?: boolean };
type Section = { key: string; title: string; items: LinkItem[] };

function prefixHrefForLocale(href: string, locale: Locale) {
  if (!href || !href.startsWith("/")) return href;
  return buildLocalizedHref(locale, href);
}

function buildSections(locale: Locale): Section[] {
  const t = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  return [
    {
      key: "platform",
      title: t["footer.section.platform"] ?? "Platform",
      items: [
        { label: t["footer.link.aboutProject"] ?? "About", href: "/about" },
        { label: t.team ?? "Team", href: "/team" },
        { label: t["footer.link.partnerships"] ?? "Partnerships", href: "/partnerships" },
      ],
    },
    {
      key: "community",
      title: t["footer.section.community"] ?? "Community",
      items: [
        { label: "Email", href: "mailto:hello@example.com", external: true },
        { label: "GitHub", href: "https://github.com", external: true },
      ],
    },
    {
      key: "legal",
      title: t["footer.section.legal"] ?? "Legal",
      items: [
        { label: t.imprint ?? "Imprint", href: "/imprint" },
        { label: t["footer.link.privacyPolicy"] ?? "Privacy Policy", href: "/privacy" },
        { label: t["footer.link.termsOfService"] ?? "Terms of Service", href: "/terms" },
        { label: t["footer.link.cookieSettings"] ?? "Cookie Settings", href: "#consent" },
      ],
    },
  ];
}

export default function Footer({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const dictionary = TRANSLATIONS[locale] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const sections = buildSections(locale);
  const copyrightTemplate =
    dictionary["footer.copyright"] ||
    "(c) {year} Simple Deutsch. All rights reserved.";
  const currentYear = String(new Date().getFullYear());

  return (
    <footer className="bg-[var(--sd-page-bg)] min-h-[20rem] md:min-h-[16rem]">
      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8 pt-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-8">
            {sections.map((section) => (
              <div key={section.key}>
                <h3
                  className="type-ui-label text-slate-900 dark:text-[rgba(255,255,255,0.92)]"
                  style={TYPO_STYLE}
                >
                  {section.title}
                </h3>
                <div className="mt-3">
                  <ul className="space-y-2 list-none p-0 m-0 leading-relaxed">
                    {section.items.map((item) => {
                      if (item.href === "#consent") {
                        return (
                          <li key={item.label}>
                            <CookieSettingsButton
                              label={item.label}
                              className="font-normal hover:underline text-slate-700 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-[rgba(255,255,255,0.9)] hover:text-slate-900 cursor-pointer bg-transparent border-0 p-0 text-left"
                              style={TYPO_STYLE}
                            />
                          </li>
                        );
                      }
                      if (item.external) {
                        return (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              className="font-normal hover:underline text-slate-700 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-[rgba(255,255,255,0.9)] hover:text-slate-900"
                              rel="noopener noreferrer"
                              style={TYPO_STYLE}
                            >
                              {item.label}
                            </a>
                          </li>
                        );
                      }
                      return (
                        <li key={item.label}>
                          <Link
                            href={prefixHrefForLocale(item.href, locale)}
                            className="font-normal hover:underline text-slate-700 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-[rgba(255,255,255,0.9)] hover:text-slate-900"
                            style={TYPO_STYLE}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
          <div className="h-px w-full bg-black/10 dark:bg-white/10" />
          <div className="py-4 text-[12px] text-slate-700 dark:text-[rgba(255,255,255,0.7)]">
            {copyrightTemplate.replace("{year}", currentYear)}
          </div>
        </div>
      </div>
    </footer>
  );
}

