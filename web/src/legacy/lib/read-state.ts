const READ_STORAGE_KEY = "sd-read-pages";
const READ_STATE_EVENT = "sd:read-state-changed";
import { hasConsent } from "./consent";

type ReadStateMap = Record<string, number>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeReadIdentifier(identifier: string | null | undefined): string | null {
  const raw = String(identifier ?? "").trim();
  if (!raw) {
    return null;
  }

  const normalizeLegacyPostsPath = (pathname: string) =>
    pathname.replace(/^\/(?:(en|ru|uk)\/)?posts(?=\/|$)/i, (_match, locale: string | undefined) =>
      locale ? `/${locale}/articles` : "/articles",
    );

  try {
    const url = new URL(raw, "https://simple-deutsch.de");
    return normalizeLegacyPostsPath(url.pathname.replace(/\/+$/g, "") || "/");
  } catch {
    return normalizeLegacyPostsPath(raw.replace(/\/+$/g, "") || "/");
  }
}

function readStateMap(): ReadStateMap {
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ReadStateMap) : {};
  } catch {
    return {};
  }
}

function writeStateMap(next: ReadStateMap) {
  if (!canUseStorage()) {
    return;
  }
  // Only persist to storage when the user has granted preferences consent.
  if (!hasConsent("preferences")) {
    // Still dispatch the event so in-memory state updates propagate within
    // the current tab (e.g. the read indicator updates without a reload).
    window.dispatchEvent(new Event(READ_STATE_EVENT));
    return;
  }
  try {
    window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(READ_STATE_EVENT));
  } catch {}
}

export function isMarkedRead(identifier: string | null | undefined): boolean {
  const normalized = normalizeReadIdentifier(identifier);
  if (!normalized) {
    return false;
  }

  return Object.hasOwn(readStateMap(), normalized);
}

export function markAsRead(identifier: string | null | undefined): boolean {
  const normalized = normalizeReadIdentifier(identifier);
  if (!normalized) {
    return false;
  }

  const current = readStateMap();
  if (Object.hasOwn(current, normalized)) {
    return false;
  }

  current[normalized] = Date.now();
  writeStateMap(current);
  return true;
}

export function subscribeToReadState(onChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === READ_STORAGE_KEY) {
      onChange();
    }
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(READ_STATE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(READ_STATE_EVENT, onChange);
  };
}
