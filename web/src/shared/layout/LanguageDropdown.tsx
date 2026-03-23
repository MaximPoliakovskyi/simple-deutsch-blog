"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { LOCALE_COOKIE, type Locale } from "@/shared/i18n/locale";
import { mapPathToLocale } from "@/shared/i18n/localeLinks";
import { useTransitionNav } from "@/shared/transition/useTransitionNav";
import Button from "@/shared/ui/Button";

const HOVER_DELAY_MS = 150;
const HOVER_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

// Language names are locale metadata rather than translated interface copy.
// Keep them here so the switcher always shows each language in its own label form.
const LANGUAGE_OPTIONS = [
  { code: "en", fullLabel: "English", shortLabel: "EN" },
  {
    code: "uk",
    fullLabel: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
    shortLabel: "\u0423\u041A",
  },
  {
    code: "ru",
    fullLabel: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    shortLabel: "\u0420\u0423",
  },
] as const satisfies ReadonlyArray<{
  code: Locale;
  fullLabel: string;
  shortLabel: string;
}>;

const SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  uk: "\u0423\u041A",
  ru: "\u0420\u0423",
};

const FULL_LABELS: Record<Locale, string> = {
  en: "English",
  uk: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
  ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
};

function getHoverSupport(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return window.matchMedia(HOVER_MEDIA_QUERY).matches;
  } catch {
    return true;
  }
}

function clearCloseTimer(timerRef: MutableRefObject<number | null>) {
  if (timerRef.current !== null) {
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

async function persistLocalePreference(targetLocale: Locale) {
  const maxAge = 60 * 60 * 24 * 365;
  const expires = Date.now() + maxAge * 1000;
  const cookieStore = (
    window as Window & {
      cookieStore?: {
        set?: (options: {
          name: string;
          value: string;
          path: string;
          sameSite: "lax";
          expires: number;
        }) => Promise<void>;
      };
    }
  ).cookieStore;

  if (cookieStore?.set) {
    await cookieStore.set({
      name: LOCALE_COOKIE,
      value: targetLocale,
      path: "/",
      sameSite: "lax",
      expires,
    });
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: Fallback when Cookie Store API is unavailable.
  document.cookie = `${LOCALE_COOKIE}=${targetLocale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function focusFirstMenuItem(menuRef: RefObject<HTMLDivElement | null>) {
  window.setTimeout(() => {
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, 0);
}

function useLocaleChange() {
  const transition = useTransitionNav();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale, postLangLinks } = useI18n();

  const query = searchParams?.toString();
  const pathWithQuery = query ? `${pathname}?${query}` : pathname;

  const changeLanguage = async (targetLocale: Locale) => {
    if (targetLocale === currentLocale) return;

    try {
      await persistLocalePreference(targetLocale);

      const href = mapPathToLocale(pathWithQuery, targetLocale, {
        translationMap: postLangLinks?.links,
      });
      if (href !== pathWithQuery) {
        transition.startNavigation(href, {
          scroll: false,
          forceInstantScrollBehavior: true,
        });
      }
    } catch {}
  };

  return { changeLanguage };
}

function useHoverPreference() {
  const [useHover, setUseHover] = useState<boolean>(getHoverSupport);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(HOVER_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent) => setUseHover(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return useHover;
}

function useDropdownInteraction() {
  const [open, setOpen] = useState(false);
  const useHover = useHoverPreference();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const closeMenu = () => {
    clearCloseTimer(closeTimerRef);
    setOpen(false);
  };

  const openMenu = () => {
    clearCloseTimer(closeTimerRef);
    setOpen(true);
  };

  const toggleMenu = () => {
    clearCloseTimer(closeTimerRef);
    setOpen((value) => !value);
  };

  const scheduleClose = () => {
    clearCloseTimer(closeTimerRef);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_DELAY_MS);
  };

  useEffect(() => {
    const handlePointerDown = (event: Event) => {
      if (!open) return;

      const target = event.target as Node | null;
      if (buttonRef.current && target && buttonRef.current.contains(target)) return;
      if (menuRef.current && target && menuRef.current.contains(target)) return;

      setOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    return () => clearCloseTimer(closeTimerRef);
  }, []);

  const handleButtonKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
      focusFirstMenuItem(menuRef);
      return;
    }

    if (event.key === "Escape") {
      closeMenu();
      buttonRef.current?.focus();
    }
  };

  const hoverHandlers = useHover
    ? {
        onMouseEnter: openMenu,
        onMouseLeave: scheduleClose,
      }
    : {};

  return {
    buttonRef,
    closeMenu,
    handleButtonKeyDown,
    hoverHandlers,
    menuRef,
    open,
    toggleMenu,
  };
}

function LanguageMenu({
  closeMenu,
  currentLocale,
  onSelectLocale,
}: {
  closeMenu?: () => void;
  currentLocale: Locale;
  onSelectLocale: (locale: Locale) => Promise<void>;
}) {
  const visibleLanguages = LANGUAGE_OPTIONS.filter((language) => language.code !== currentLocale);

  return (
    <>
      {visibleLanguages.map((language, index) => (
        <li
          key={language.code}
          className={
            index < visibleLanguages.length - 1
              ? "border-b border-[var(--sd-border-subtle)]"
              : undefined
          }
          role="none"
        >
          <button
            className="sd-button sd-button--ghost sd-button--sm w-full justify-center rounded-none"
            onClick={async () => {
              await onSelectLocale(language.code);
              closeMenu?.();
            }}
            role="menuitem"
            type="button"
          >
            {language.shortLabel}
          </button>
        </li>
      ))}
    </>
  );
}

export default function LanguageDropdown() {
  const { locale: currentLocale, t } = useI18n();
  const { changeLanguage } = useLocaleChange();
  const { buttonRef, closeMenu, handleButtonKeyDown, hoverHandlers, menuRef, open, toggleMenu } =
    useDropdownInteraction();

  return (
    <div className="relative inline-block text-left" {...hoverHandlers}>
      <Button
        ref={buttonRef}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t("nav.language")} (${FULL_LABELS[currentLocale]})`}
        className="h-[38px] w-[38px] rounded-full border-[0.8px] border-transparent bg-white p-0 text-[#171717] shadow-[var(--shadow-sm)]"
        onClick={toggleMenu}
        onKeyDown={handleButtonKeyDown}
        size="icon"
        title={FULL_LABELS[currentLocale]}
      >
        <span className="sr-only">{t("nav.language")}</span>
        <span className="leading-none text-[var(--sd-text)]">{SHORT_LABELS[currentLocale]}</span>
      </Button>

      {open ? (
        <div
          ref={menuRef}
          className="absolute left-1/2 z-[var(--z-dropdown)] mt-2 w-[38px] -translate-x-1/2 overflow-hidden rounded-full border border-[var(--sd-border-subtle)] bg-white shadow-[var(--shadow-sm)]"
        >
          <ul
            aria-label={t("nav.language")}
            className="m-0 list-none overflow-hidden rounded-full p-0"
          >
            <LanguageMenu
              closeMenu={closeMenu}
              currentLocale={currentLocale}
              onSelectLocale={changeLanguage}
            />
          </ul>
        </div>
      ) : null}
    </div>
  );
}
