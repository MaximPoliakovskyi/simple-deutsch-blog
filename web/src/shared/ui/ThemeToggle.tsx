"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import {
  applyTheme,
  runThemeTransition,
  subscribeRootTheme,
  type Theme,
} from "@/shared/theme/client";
import Button from "@/shared/ui/Button";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    return subscribeRootTheme(setTheme);
  }, []);

  if (theme === null) return null;

  const isDark = theme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = t(nextTheme === "dark" ? "theme.dark" : "theme.light");

  return (
    <Button
      aria-label={label}
      aria-pressed={isDark}
      className="h-[38px] w-[38px] rounded-full border-[0.8px] border-transparent bg-white p-0 text-[#404040] shadow-[var(--shadow-sm)]"
      onClick={() => runThemeTransition(() => applyTheme(nextTheme))}
      size="icon"
      title={label}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" role="img" aria-hidden="true">
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      )}
    </Button>
  );
}
