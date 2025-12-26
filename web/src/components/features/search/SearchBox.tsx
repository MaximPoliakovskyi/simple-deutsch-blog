"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";
import { useI18n } from "@/core/i18n/LocaleProvider";

type Props = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
};

const DEFAULT_DEBOUNCE_MS = 200; // tighter debounce to reduce jank while typing

export default function SearchBox({
  placeholder,
  className = "",
  autoFocus = false,
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const initial = (searchParams.get("q") ?? "").trim();
  const [value, setValue] = useState(initial);
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    const next = (searchParams.get("q") ?? "").trim();
    if (document.activeElement !== inputRef.current && next !== value) {
      setValue(next);
    }
  }, [searchParams, value]);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = deferredValue.trim();
      const nextUrl = q ? `/search?q=${encodeURIComponent(q)}` : `/search`;
      const currentQ = (searchParams.get("q") ?? "").trim();
      if (currentQ === q) return;
      startTransition(() => {
        router.replace(nextUrl);
      });
    }, debounceMs);
    return () => clearTimeout(t);
  }, [deferredValue, debounceMs, router, searchParams]);

  const finalPlaceholder = placeholder ?? t("searchPlaceholder");
  const finalAria = t("searchAria");
  const finalClear = "Clear"; // fixed label across locales per requirement

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        type="search"
        inputMode="search"
        {...(autoFocus ? { autoFocus: true } : {})}
        value={value}
        onChange={(e) => setValue(e.target.value)}
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
          // color: light background (#FAFAFA) in light; theme background in dark
          "bg-[#FAFAFA] text-neutral-900 placeholder-neutral-500 border",
          // use explicit border color to match header trigger
          "border-[#E6E7EB]",
          "dark:bg-[hsl(var(--bg))] dark:text-neutral-100 dark:placeholder-neutral-400 dark:border-white/10",
          // focus (no UA blue outline)
          "appearance-none outline-none focus:outline-none focus:ring-2 focus:ring-(--sd-accent) focus:ring-offset-0",
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
