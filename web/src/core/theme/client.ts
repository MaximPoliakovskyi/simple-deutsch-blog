"use client";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sd-theme";
const THEME_TRANSITION_MS = 350;
const THEME_STEP_DEBUG_WINDOW_MS = 1000;
const DEBUG_THEME_STEP =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_DEBUG_THEME_STEP === "1";

type DebugMutationRecord = {
  target: Element;
  attrs: Set<string>;
};

function getRoot(): HTMLElement {
  return document.documentElement;
}

export function getRootTheme(): Theme {
  return getRoot().classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = getRoot() as HTMLElement & { __sdThemeTimer?: number };
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (DEBUG_THEME_STEP) {
    debugThemeStep(root, theme);
  }

  if (!prefersReduce) {
    if (root.__sdThemeTimer) window.clearTimeout(root.__sdThemeTimer);
    root.classList.add("theme-transition");
  }

  root.classList.toggle("dark", theme === "dark");

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}

  if (!prefersReduce) {
    root.__sdThemeTimer = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, THEME_TRANSITION_MS);
  }
}

export function subscribeRootTheme(onThemeChange: (theme: Theme) => void): () => void {
  const root = getRoot();
  const emit = () => onThemeChange(getRootTheme());

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") {
        emit();
        break;
      }
    }
  });

  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  emit();

  return () => observer.disconnect();
}

function elementSummary(el: Element): string {
  const htmlEl = el as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const id = htmlEl.id ? `#${htmlEl.id}` : "";
  const className =
    typeof htmlEl.className === "string" ? htmlEl.className.trim().replace(/\s+/g, ".") : "";
  const cls = className ? `.${className}` : "";
  const dsKeys = Object.keys(htmlEl.dataset ?? {}).sort();
  return `${tag}${id}${cls}${dsKeys.length ? ` data:[${dsKeys.join(",")}]` : ""}`;
}

function debugThemeStep(_root: HTMLElement, nextTheme: Theme): void {
  const seen = new Map<Element, DebugMutationRecord>();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type !== "attributes" || !record.target) continue;
      const target = record.target as Element;
      const name = record.attributeName ?? "";
      if (name !== "class" && name !== "style" && name !== "data-theme") continue;

      const existing = seen.get(target);
      if (existing) {
        existing.attrs.add(name);
      } else {
        seen.set(target, { target, attrs: new Set([name]) });
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });

  window.setTimeout(() => {
    observer.disconnect();

    const changed = Array.from(seen.values()).map((entry) => ({
      node: elementSummary(entry.target),
      attrs: Array.from(entry.attrs).sort().join(","),
    }));

    const topCandidates: string[] = [];
    const allElements = document.querySelectorAll<HTMLElement>("body *");
    for (const el of allElements) {
      const style = window.getComputedStyle(el);
      const pos = style.position;
      if (pos !== "fixed" && pos !== "sticky") continue;
      const rect = el.getBoundingClientRect();
      const nearTop = rect.top >= -1 && rect.top <= 10;
      if (!nearTop) continue;

      const roundedHeight = Math.round(rect.height);
      if (roundedHeight <= 10) {
        topCandidates.push(
          `${elementSummary(el)} pos:${pos} top:${Math.round(rect.top)} h:${roundedHeight}`,
        );
      }
    }

    const fixedHeaders: string[] = [];
    for (const el of allElements) {
      const style = window.getComputedStyle(el);
      const pos = style.position;
      if (pos !== "fixed" && pos !== "sticky") continue;
      const rect = el.getBoundingClientRect();
      const nearTop = rect.top >= -1 && rect.top <= 10;
      if (!nearTop) continue;
      if (Math.round(rect.height) > 10) {
        fixedHeaders.push(
          `${elementSummary(el)} pos:${pos} top:${Math.round(rect.top)} h:${Math.round(rect.height)}`,
        );
      }
    }

    console.groupCollapsed(
      `[theme-step-debug] theme=${nextTheme} changed=${changed.length} window=${THEME_STEP_DEBUG_WINDOW_MS}ms`,
    );
    console.log("[theme-step-debug] changed", changed);
    console.table(changed);
    console.log("[theme-step-debug] top-thin-bars", topCandidates);
    console.log("[theme-step-debug] top-fixed-headers", fixedHeaders);
    console.groupEnd();
  }, THEME_STEP_DEBUG_WINDOW_MS);
}
