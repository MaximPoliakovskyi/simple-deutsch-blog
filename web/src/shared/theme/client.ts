"use client";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "sd-theme";
const THEME_CROSSFADE_MS = 220;
const THEME_CROSSFADE_EASE = "ease-in-out";
const THEME_OVERLAY_CLASS = "sd-theme-crossfade-overlay";

function getRoot(): HTMLElement {
  return document.documentElement;
}

export function getRootTheme(): Theme {
  return getRoot().classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  const root = getRoot();
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

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
        if (activeOverlay === overlay) {
          overlay.style.opacity = "0";
        }
      });
    },
    Math.round(THEME_CROSSFADE_MS / 2),
  );

  const cleanupId = window.setTimeout(() => {
    if (activeOverlay === overlay) {
      clearThemeTransitionArtifacts();
    }
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
