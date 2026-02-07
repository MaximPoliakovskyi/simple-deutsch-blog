"use client";

import SearchButton from "@/components/features/search/SearchButton";
import LanguageDropdown from "@/components/layout/LanguageDropdown";
import NavLinks from "@/components/layout/NavLinks";
import type { NavLocale } from "@/components/layout/navConfig";
import ThemeToggle from "@/components/ui/ThemeToggle";

type Lang = NavLocale;

type Props = {
  currentLocale: Lang;
  pathname: string | null;
  buildLocalePath: (path: string, target?: Lang) => string;
  label: (key: string, fallback: string) => string;
  tFromProvider: (key: string) => string;
};

export default function NavigationDesktop({
  currentLocale,
  pathname,
  buildLocalePath,
  label,
  tFromProvider,
}: Props) {
  return (
    <div className="hidden items-center gap-6 md:flex">
      <NavLinks mode="desktop" buildLocalePath={buildLocalePath} label={label} />

      <div className="flex items-center gap-4">
        <SearchButton variant="default" ariaLabel={label("searchPlaceholder", "Find an article")} />
        <div className="relative">
          <LanguageDropdown
            currentLocale={currentLocale}
            routeLocale={currentLocale}
            buildHref={(target: Lang) => buildLocalePath(pathname || "/", target)}
            t={tFromProvider}
          />
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
