"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavLocale } from "@/components/layout/navConfig";
import { useTransitionNav } from "@/components/transition/useTransitionNav";
import { useI18n } from "@/core/i18n/LocaleProvider";
import { type Locale, parseLocaleFromPath } from "@/i18n/locale";
import { mapPathToLocale } from "@/i18n/pathMapping";

type Lang = NavLocale;

type LanguageDropdownProps = {
  currentLocale: Lang;
  buildHref: (target: Lang) => string;
  t: (k: string) => string;
  routeLocale?: Lang;
};

const HOVER_DELAY_MS = 150;

function usePostLanguageSwitch() {
  const transition = useTransitionNav();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale, postLangLinks } = useI18n();

  const routeLocale = parseLocaleFromPath(pathname) ?? currentLocale;
  const siteLang: Locale = postLangLinks?.currentLang ?? routeLocale;
  const query = searchParams?.toString();
  const pathWithQuery = query ? `${pathname}?${query}` : pathname;

  const persistLocaleCookie = async (targetLang: Locale) => {
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
      await Promise.all([
        cookieStore.set({
          name: "NEXT_LOCALE",
          value: targetLang,
          path: "/",
          sameSite: "lax",
          expires,
        }),
        cookieStore.set({
          name: "locale",
          value: targetLang,
          path: "/",
          sameSite: "lax",
          expires,
        }),
      ]);
      return;
    }

    // Keep both cookie names so server-side fallbacks (including 404) stay localized.
    // biome-ignore lint/suspicious/noDocumentCookie: Fallback when Cookie Store API is unavailable.
    document.cookie = `NEXT_LOCALE=${targetLang}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    // biome-ignore lint/suspicious/noDocumentCookie: Fallback when Cookie Store API is unavailable.
    document.cookie = `locale=${targetLang}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  const changeLang = async (targetLang: Locale) => {
    if (targetLang === siteLang && targetLang === routeLocale) return;

    try {
      await persistLocaleCookie(targetLang);
      const href = mapPathToLocale(pathWithQuery, targetLang, {
        translationMap: postLangLinks?.links,
      });
      if (href !== pathWithQuery) {
        transition.navigateFromLanguageSwitch(href);
      }
    } catch {}
  };

  return {
    currentSiteLang: siteLang,
    changeLang,
  };
}

function NavLanguageDropdown({
  closeMenu,
  currentSiteLangOverride,
}: {
  closeMenu?: () => void;
  currentSiteLangOverride?: Lang;
}) {
  const { currentSiteLang, changeLang } = usePostLanguageSwitch();

  const LANGS = [
    { code: "en", label: "En" },
    { code: "uk", label: "\u0423\u043A" },
    { code: "ru", label: "\u0420\u0443" },
  ] as const;

  const effectiveCurrent = currentSiteLangOverride ?? currentSiteLang;
  const visibleLangs = LANGS.filter((l) => l.code !== effectiveCurrent);

  return (
    <>
      {visibleLangs.map((item, idx) => (
        <li
          key={item.code}
          role="none"
          className={
            idx < visibleLangs.length - 1 ? "border-b border-neutral-100 dark:border-white/6" : ""
          }
        >
          <button
            role="menuitem"
            type="button"
            onClick={async () => {
              await changeLang(item.code);
              closeMenu?.();
            }}
            className={
              "w-full text-center py-3 text-sm leading-none transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] " +
              "hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
            }
          >
            {item.label}
          </button>
        </li>
      ))}
    </>
  );
}

export default function LanguageDropdown({
  currentLocale,
  buildHref,
  t,
  routeLocale,
}: LanguageDropdownProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  void buildHref;

  const _order: Lang[] = ["en", "uk", "ru"];
  void _order;
  const labelsShort: Record<Lang, string> = {
    en: "EN",
    uk: "\u0423\u041A",
    ru: "\u0420\u0423",
  };
  const labelsFull: Record<Lang, string> = {
    en: "English",
    uk: "\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430",
    ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
  };

  useEffect(() => {
    function onDoc(e: Event) {
      const t = e.target as Node | null;
      if (!open) return;
      if (btnRef.current && t && btnRef.current.contains(t)) return;
      if (menuRef.current && t && menuRef.current.contains(t)) return;
      setOpen(false);
    }
    window.addEventListener("pointerdown", onDoc);
    return () => window.removeEventListener("pointerdown", onDoc);
  }, [open]);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const [useHover, setUseHover] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setUseHover(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => {
        const first = menuRef.current?.querySelector<HTMLButtonElement>("button");
        first?.focus();
      }, 0);
    } else if (e.key === "Escape") {
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div
      className="relative inline-block text-left"
      {...(useHover ? { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave } : {})}
    >
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className={
          "flex items-center justify-center w-9.5 h-9.5 rounded-full text-sm " +
          "transition transform-gpu duration-200 ease-out hover:scale-[1.03] shadow-sm hover:shadow-md focus:outline-none focus-visible:outline-none " +
          "cursor-pointer " +
          "sd-pill"
        }
        style={{ padding: 0, outlineColor: "oklch(0.371 0 0)" }}
        aria-label={t("language") || `Language (${labelsFull[currentLocale]})`}
        title={labelsFull[currentLocale]}
      >
        <span className="sr-only">{t("language")}</span>
        <span className="leading-none text-neutral-900 dark:text-neutral-100">
          {labelsShort[routeLocale ?? currentLocale]}
        </span>
      </button>

      {open && (
        <ul
          ref={menuRef}
          aria-label={t("language")}
          className={
            "absolute left-1/2 -translate-x-1/2 mt-2 w-9.5 origin-top rounded-[9999px] px-0 " +
            "bg-[#FFFFFF] dark:bg-[#1f1f1f] border border-[#E6E7EB] dark:border-[#2b2b2b] " +
            "overflow-hidden z-50 shadow-sm transition-colors duration-200 ease-out"
          }
        >
          <NavLanguageDropdown
            closeMenu={() => setOpen(false)}
            currentSiteLangOverride={routeLocale ?? currentLocale}
          />
        </ul>
      )}
    </div>
  );
}
