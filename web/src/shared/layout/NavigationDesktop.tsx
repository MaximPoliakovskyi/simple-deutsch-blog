"use client";

import { Suspense } from "react";
import SearchButton from "@/features/search/SearchButton";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import LanguageDropdown from "@/shared/layout/LanguageDropdown";
import NavLinks from "@/shared/layout/NavLinks";
import ThemeToggle from "@/shared/ui/ThemeToggle";

export default function NavigationDesktop() {
  const { t } = useI18n();

  return (
    <div className="hidden items-center gap-6 md:flex">
      <div className="flex items-center gap-6">
        <NavLinks mode="desktop" />
      </div>

      <div className="flex items-center gap-4">
        <SearchButton variant="default" ariaLabel={t("search.placeholder")} />
        <div className="relative">
          <Suspense fallback={null}>
            <LanguageDropdown />
          </Suspense>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
