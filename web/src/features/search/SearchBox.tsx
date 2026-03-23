"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { buildLocalizedHref } from "@/shared/i18n/localeLinks";
import Button from "@/shared/ui/Button";

type Props = {
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
};

export default function SearchBox({ placeholder, className = "", autoFocus = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale, t } = useI18n();

  const initial = (searchParams.get("q") ?? "").trim();
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const next = (searchParams.get("q") ?? "").trim();
    if (document.activeElement !== inputRef.current && next !== value) {
      setValue(next);
    }
  }, [searchParams, value]);

  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        ref={inputRef}
        className="w-full rounded-xl border border-[#E6E7EB] bg-transparent px-4 py-2 text-base text-neutral-900 placeholder-neutral-500 outline-none focus:outline-none focus:ring-2 focus:ring-[var(--sd-accent)] focus:ring-offset-0 dark:border-white/10 dark:text-neutral-100 dark:placeholder-neutral-400"
        aria-label={t("search.label")}
        inputMode="search"
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          const query = next.trim();
          const searchHref = buildLocalizedHref(locale, "/search");
          const nextUrl = query ? `${searchHref}?q=${encodeURIComponent(query)}` : searchHref;
          const currentQuery = (searchParams.get("q") ?? "").trim();
          if (currentQuery === query) return;
          startTransition(() => {
            router.replace(nextUrl, { scroll: false });
          });
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            setValue("");
            inputRef.current?.focus();
          }
        }}
        placeholder={placeholder ?? t("search.placeholder")}
        type="search"
        value={value}
      />

      {value ? (
        <Button
          aria-label={t("search.clear")}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
          onClick={() => {
            setValue("");
            startTransition(() => {
              router.replace(buildLocalizedHref(locale, "/search"), { scroll: false });
            });
          }}
          size="sm"
          variant="ghost"
        >
          {t("search.clear")}
        </Button>
      ) : null}
    </div>
  );
}
