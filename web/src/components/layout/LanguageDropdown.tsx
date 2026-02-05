"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavLocale } from "@/components/layout/navConfig";
import { useI18n } from "@/core/i18n/LocaleProvider";
import { isLocale, type Locale, parseLocaleFromPath } from "@/i18n/locale";

type Lang = NavLocale;

type LanguageDropdownProps = {
  currentLocale: Lang;
  buildHref: (target: Lang) => string;
  t: (k: string) => string;
  routeLocale?: Lang;
};

const HOVER_DELAY_MS = 150;

function replaceLeadingLocale(path: string, target: Lang) {
  const p = path || "/";
  const segs = p.split("/").filter(Boolean);
  if (segs.length === 0) return `/${target}`;
  if (isLocale(segs[0])) segs[0] = target;
  else segs.unshift(target);
  return `/${segs.join("/")}`;
}

function useLanguage() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { locale: currentLocale } = useI18n();

  function persistLocale(_next: Lang) {}

  function setLocale(next: Lang) {
    persistLocale(next);

    try {
      const base = replaceLeadingLocale(pathname, next);
      const qs = searchParams?.toString();
      const newPath = qs ? `${base}?${qs}` : base;
      if (newPath !== pathname) router.push(newPath);
    } catch {
      const root = `/${next}`;
      if (root !== pathname) router.push(root);
    }
  }

  const routeLocale = parseLocaleFromPath(pathname) ?? currentLocale;

  return {
    locale: routeLocale,
    setLocale,
    persistLocale,
  } as { locale: Lang; setLocale: (l: Lang) => void; persistLocale: (l: Lang) => void };
}

function usePostLanguageSwitch() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { locale: currentLocale, setLocale, persistLocale } = useLanguage();
  const { postLangLinks } = useI18n();

  let siteLang: Locale = currentLocale;
  const languageLinks = postLangLinks?.links ?? null;
  const currentFromLinks = postLangLinks?.currentLang ?? null;
  if (currentFromLinks) siteLang = currentFromLinks;

  const postsIdx = pathname.indexOf("/posts/");
  let isPost = false;
  let slug: string | null = null;
  if (postsIdx !== -1) {
    isPost = true;
    const after = pathname.substring(postsIdx + "/posts/".length);
    if (after) {
      const nextSlash = after.indexOf("/");
      slug = nextSlash === -1 ? after : after.substring(0, nextSlash);
    }
  }

  const changeLang = async (targetLang: Locale) => {
    if (targetLang === siteLang && targetLang === currentLocale) return;

    if (isPost && slug && postLangLinks) {
      const href = postLangLinks.links[targetLang] ?? null;
      if (!href) return;
      try {
        persistLocale(targetLang);
      } catch {}
      try {
        await router.push(href);
      } catch {}
      return;
    }

    try {
      setLocale(targetLang);
    } catch {}
  };

  return {
    currentSiteLang: siteLang,
    changeLang,
    languageLinks,
    isPost,
    hasSlug: Boolean(slug),
  };
}

function NavLanguageDropdown({
  closeMenu,
  currentSiteLangOverride,
}: {
  closeMenu?: () => void;
  currentSiteLangOverride?: Lang;
}) {
  const { currentSiteLang, changeLang, languageLinks, isPost, hasSlug } = usePostLanguageSwitch();

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
          {(() => {
            const linkAvailable = !isPost || !hasSlug || Boolean(languageLinks?.[item.code]);
            return (
              <button
                role="menuitem"
                type="button"
                onClick={async () => {
                  if (!linkAvailable) return;
                  await changeLang(item.code);
                  closeMenu?.();
                }}
                aria-disabled={!linkAvailable}
                disabled={!linkAvailable}
                className={
                  "w-full text-center py-3 text-sm leading-none transition-colors duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[var(--sd-accent)] " +
                  "hover:bg-neutral-100 dark:hover:bg-[rgba(255,255,255,0.03)] " +
                  (!linkAvailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer")
                }
              >
                {item.label}
              </button>
            );
          })()}
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
        const first = menuRef.current?.querySelector<HTMLAnchorElement>("a");
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
