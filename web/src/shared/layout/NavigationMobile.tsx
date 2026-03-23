"use client";

import Link from "next/link";
import { type MouseEvent, type RefObject, Suspense, useEffect, useRef } from "react";
import SearchButton from "@/features/search/SearchButton";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import LanguageDropdown from "@/shared/layout/LanguageDropdown";
import NavLinks from "@/shared/layout/NavLinks";
import { lockScroll, unlockScroll } from "@/shared/lib/scrollLock";

type MobileControlsProps = {
  open: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
  onToggleMenu: () => void;
};

type MobileDrawerProps = {
  open: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
  isDarkMobile: boolean;
  onCloseMenu: () => void;
  onLogoClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onToggleTheme: () => void;
};

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function NavigationMobileControls({ open, toggleRef, onToggleMenu }: MobileControlsProps) {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 md:hidden">
      <SearchButton ariaLabel={t("search.placeholder")} variant="icon" />
      <div className="relative">
        <Suspense fallback={null}>
          <LanguageDropdown />
        </Suspense>
      </div>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        className="rounded p-2 outline-none ring-0 transition hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
        onClick={onToggleMenu}
        aria-label={open ? t("menu.close") : t("menu.open")}
        title={open ? t("menu.close") : t("menu.open")}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true">
          {open ? (
            <path
              d="M6 6l12 12M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    </div>
  );
}

export function NavigationMobileDrawer({
  open,
  toggleRef,
  isDarkMobile,
  onCloseMenu,
  onLogoClick,
  onToggleTheme,
}: MobileDrawerProps) {
  const { locale, t } = useI18n();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!open) return;

    try {
      lockScroll();
    } catch {}

    return () => {
      try {
        unlockScroll();
      } catch {}
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const focusTarget =
      firstFocusRef.current ??
      panelRef.current?.querySelector<HTMLElement>(
        'a, button, [href], [tabindex]:not([tabindex="-1"])',
      );

    focusTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseMenu();
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = getFocusableElements(panel);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (!activeElement || activeElement === first || !panel.contains(activeElement)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
        return;
      }

      if (!activeElement || activeElement === last || !panel.contains(activeElement)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCloseMenu, open, toggleRef]);

  return (
    <div
      className={[
        "fixed inset-0 z-[var(--z-drawer)] md:hidden",
        open ? "" : "pointer-events-none",
      ].join(" ")}
    >
      <div
        className={[
          "absolute inset-0 bg-[var(--sd-overlay-backdrop)] transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onCloseMenu}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu.mobile")}
        className={[
          "absolute inset-0",
          "bg-[var(--sd-page-bg)] text-[var(--sd-text)]",
          "transition-transform duration-300 will-change-transform",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href={buildLocalizedHref(locale, "/")}
            onClick={onLogoClick}
            className="text-xl font-semibold tracking-tight"
            ref={firstFocusRef}
          >
            simple-deutsch.de
          </Link>
          <button
            type="button"
            className="rounded p-2 hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
            onClick={() => {
              onCloseMenu();
              toggleRef.current?.focus();
            }}
            aria-label={t("menu.close")}
            title={t("menu.close")}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true">
              <path
                d="M6 6l12 12M6 18L18 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav aria-label={t("menu.mobile")} className="mx-auto w-full max-w-5xl px-4 py-4">
          <ul className="m-0 list-none space-y-1 p-0">
            <NavLinks mode="mobile" onNavigate={onCloseMenu} />
            <li>
              <button
                type="button"
                onClick={onToggleTheme}
                className="block w-full rounded-lg px-2 py-3 text-left text-base hover:bg-neutral-200/60 focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] dark:hover:bg-neutral-800/60"
              >
                {isDarkMobile ? t("theme.light") : t("theme.dark")}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
