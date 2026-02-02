"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { TRANSLATIONS } from "@/core/i18n/i18n";
import { useI18n } from "@/core/i18n/LocaleProvider";

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
};

export default function SearchBox({
  placeholder,
  className = "",
  autoFocus = false,
  debounceMs = 0,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, locale } = useI18n();
  const pathname = usePathname() || "/";
  const pathLocale = ((): "en" | "ru" | "uk" => {
    const seg = pathname.split("/")[1];
    if (seg === "ru") return "ru";
    if (seg === "uk") return "uk";
    return "en";
  })();

  const label = (key: string, fallback: string) => {
    try {
      const v = t(key);
      if (v && v !== key) return v;
    } catch {}
    try {
      const fast = TRANSLATIONS[pathLocale]?.[key];
      if (fast && fast !== key) return fast;
    } catch {}
    return fallback;
  };

  const initial = (searchParams.get("q") ?? "").trim();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const next = (searchParams.get("q") ?? "").trim();
    if (document.activeElement !== inputRef.current && next !== value) {
      setValue(next);
    }
  }, [searchParams, value]);

  // Immediate navigation on input change handled in `onChange`

  const finalPlaceholder = placeholder ?? label("searchPlaceholder", "Find an article");
  const finalAria = label("searchAria", "Search");
  const finalClear = label("search.clear", "Clear");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        {...(autoFocus ? { autoFocus: true } : {})}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          const q = next.trim();
          // Preserve locale prefix in search URL using the path-derived locale
          const localePrefix = pathLocale && pathLocale !== "en" ? `/${pathLocale}` : "";
          const nextUrl = q
            ? `${localePrefix}/search?q=${encodeURIComponent(q)}`
            : `${localePrefix}/search`;
          const currentQ = (searchParams.get("q") ?? "").trim();
          if (currentQ === q) return;
          startTransition(() => {
            router.replace(nextUrl);
          });
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.preventDefault();
            setValue("");
            inputRef.current?.focus();
          }
        }}
        placeholder={finalPlaceholder}
        aria-label={finalAria}
        className={[
          // layout
          "w-full rounded-xl px-4 py-2 text-base",
          // color: transparent to remove any background in light and dark
          "bg-transparent text-neutral-900 placeholder-neutral-500 border",
          // use explicit border color to match header trigger
          "border-[#E6E7EB]",
          "dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-white/10",
          // focus (no UA blue outline)
          "appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-[var(--sd-accent)] focus:ring-offset-0",
        ].join(" ")}
      />

      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label={finalClear}
          className={[
            "rounded-lg px-3 py-2 text-sm transition-colors border",
            "text-neutral-700 border-neutral-300 hover:bg-neutral-100",
            "dark:text-neutral-300 dark:border-white/10 dark:hover:bg-white/5",
          ].join(" ")}
        >
          {finalClear}
        </button>
      ) : null}
    </div>
  );
}
