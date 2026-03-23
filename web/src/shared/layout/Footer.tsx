import Link from "next/link";
import { formatTranslation, getTranslations } from "@/shared/i18n/i18n";
import { DEFAULT_LOCALE, type Locale } from "@/shared/i18n/locale";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import { getFooterSections } from "@/shared/layout/footerLinks";
import Container from "@/shared/ui/Container";

type FooterProps = {
  locale?: Locale;
};

type FooterItem = {
  external?: boolean;
  href: string;
  label: string;
};

type FooterLinkItemProps = {
  item: FooterItem;
  locale: Locale;
};

function FooterLinkItem({ item, locale }: FooterLinkItemProps) {
  if (item.external) {
    return (
      <a
        href={item.href}
        className="text-[16px] font-normal leading-6 text-[#314158] hover:underline"
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={buildLocalizedHref(locale, item.href)}
      className="text-[16px] font-normal leading-6 text-[#314158] hover:underline"
    >
      {item.label}
    </Link>
  );
}

export default function Footer({ locale = DEFAULT_LOCALE }: FooterProps) {
  const dictionary = getTranslations(locale);
  const sections = getFooterSections(locale);
  const copyrightTemplate = dictionary["footer.copyright"];
  const currentYear = String(new Date().getFullYear());

  return (
    <footer className="bg-[var(--sd-footer-bg)]">
      <div>
        <Container className="px-4 pb-12 pt-12 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-[16px] font-medium leading-[26px] text-[#0f172b] dark:text-[rgba(255,255,255,0.92)]">
                  {section.title}
                </h2>
                <div className="mt-3">
                  <ul className="m-0 list-none space-y-2 p-0">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <FooterLinkItem item={item} locale={locale} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div>
        <Container className="px-4 lg:px-8">
          <div className="h-px w-full bg-black/10 dark:bg-white/10" />
          <div className="py-4 text-[12px] leading-4 text-[#314158] dark:text-[rgba(255,255,255,0.7)]">
            {formatTranslation(copyrightTemplate, { year: currentYear })}
          </div>
        </Container>
      </div>
    </footer>
  );
}
