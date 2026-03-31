"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getRootTheme,
  runThemeTransition,
  subscribeRootTheme,
  type Theme,
} from "@/lib/theme";

/**
 * Subscribes to the current theme and provides a toggle function.
 *
 * @returns `{ theme, toggleTheme }` where `theme` is `"light" | "dark"`.
 *
 * @example
 * const { theme, toggleTheme } = useTheme();
 * <button onClick={toggleTheme}>{theme}</button>
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    return subscribeRootTheme(setTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    runThemeTransition(() => {
      const next = getRootTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
    });
  }, []);

  return { theme, toggleTheme } as const;
}
