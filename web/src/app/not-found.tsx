// app/not-found.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { DEFAULT_LOCALE, type Locale, parseLocaleFromPath } from "@/i18n/locale";

export default function NotFound({ locale }: { locale?: Locale }) {
  const pathname = usePathname();

  const inferred = (() => {
    if (locale) return locale;
    const p = parseLocaleFromPath(pathname || "/");
    return p ?? DEFAULT_LOCALE;
  })();

  const lang = inferred;
  const t = TRANSLATIONS[lang] ?? TRANSLATIONS[DEFAULT_LOCALE];
  const homeHref = `/${lang}`;

  return (
    // Fullscreen overlay above everything (including header)
    <div className="fixed inset-0 z-100 grid place-items-center bg-black text-white">
      <div className="text-center px-4">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <svg
            className="h-6 w-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {/* Simple “slash-circle” broken link */}
            <circle cx="12" cy="12" r="10" className="opacity-40" />
            <line x1="4" y1="4" x2="20" y2="20" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold">{t["notFound.title"] ?? t.pageNotFoundHeading}</h1>

        {/* Message */}
        <p className="mx-auto mt-3 max-w-md text-sm text-white/75">
          {t["notFound.description"] ?? t.pageNotFoundMessage}
        </p>

        {/* CTA */}
        <div className="mt-6">
          <Link
            href={homeHref}
            className="inline-flex items-center rounded-md bg-[#1d9bf0] px-4 py-2 text-sm font-medium text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d9bf0]/70"
          >
            {t["notFound.backToHome"] ?? t.backToHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
