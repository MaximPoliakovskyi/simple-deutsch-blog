"use client";

import LanguageDropdown from "./language-dropdown";
import type { NavLocale } from "./nav-config";
import NavLinks from "./nav-links";
import SearchButton from "./search-button";
import ThemeToggle from "./theme-toggle";

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
