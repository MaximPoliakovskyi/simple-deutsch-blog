"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import { DESKTOP_NAV_LINKS, MOBILE_NAV_LINKS } from "@/shared/layout/navConfig";

type Props = {
  mode: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function NavLinks({ mode, onNavigate }: Props) {
  const router = useRouter();
  const { locale, t } = useI18n();
  const items = mode === "desktop" ? DESKTOP_NAV_LINKS : MOBILE_NAV_LINKS;

  const prefetchIntent = (href: string) => {
    router.prefetch(href);
  };

  if (mode === "desktop") {
    return (
      <>
        {items.map((item) => {
          const href = buildLocalizedHref(locale, item.path);

          return (
            <Link
              key={item.path}
              href={href}
              prefetch
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              className="text-sm text-neutral-700 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:text-neutral-300"
            >
              {t(item.key)}
            </Link>
          );
        })}
      </>
    );
  }

  return (
    <>
      {items.map((item) => {
        const href = buildLocalizedHref(locale, item.path);

        return (
          <li key={item.path}>
            <Link
              href={href}
              prefetch
              scroll={item.path === "/search" ? false : undefined}
              onMouseEnter={() => prefetchIntent(href)}
              onFocus={() => prefetchIntent(href)}
              onClick={onNavigate}
              className="block rounded-lg px-2 py-3 text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
            >
              {t(item.key)}
            </Link>
          </li>
        );
      })}
    </>
  );
}
