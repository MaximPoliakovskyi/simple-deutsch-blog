"use client";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sd-theme";
const THEME_CROSSFADE_MS = 220;
const THEME_CROSSFADE_EASE = "ease-in-out";
const THEME_OVERLAY_CLASS = "sd-theme-crossfade-overlay";
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
  const root = getRoot();

  if (DEBUG_THEME_STEP) {
    debugThemeStep(root, theme);
  }

  root.classList.toggle("dark", theme === "dark");

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

let activeOverlay: HTMLDivElement | null = null;
let activeTimers: number[] = [];

function clearThemeTransitionArtifacts() {
  for (const id of activeTimers) {
    window.clearTimeout(id);
  }
  activeTimers = [];
  if (activeOverlay?.parentNode) {
    activeOverlay.parentNode.removeChild(activeOverlay);
  }
  activeOverlay = null;
}

export function runThemeTransition(toggleTheme: () => void) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    toggleTheme();
    return;
  }

  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduce) {
    clearThemeTransitionArtifacts();
    toggleTheme();
    return;
  }

  clearThemeTransitionArtifacts();

  const overlay = document.createElement("div");
  overlay.className = THEME_OVERLAY_CLASS;
  overlay.style.transitionDuration = `${Math.round(THEME_CROSSFADE_MS / 2)}ms`;
  overlay.style.transitionTimingFunction = THEME_CROSSFADE_EASE;
  overlay.style.opacity = "0";
  overlay.style.backgroundColor =
    window.getComputedStyle(document.body).backgroundColor ||
    window.getComputedStyle(document.documentElement).backgroundColor ||
    "#ffffff";
  document.body.appendChild(overlay);
  activeOverlay = overlay;

  const fadeInId = window.setTimeout(() => {
    overlay.style.opacity = "1";
  }, 0);

  const switchId = window.setTimeout(
    () => {
      toggleTheme();
      requestAnimationFrame(() => {
        if (!activeOverlay || overlay !== activeOverlay) return;
        overlay.style.opacity = "0";
      });
    },
    Math.round(THEME_CROSSFADE_MS / 2),
  );

  const cleanupId = window.setTimeout(() => {
    if (activeOverlay !== overlay) return;
    clearThemeTransitionArtifacts();
  }, THEME_CROSSFADE_MS + 40);

  activeTimers = [fadeInId, switchId, cleanupId];
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
