const READ_STORAGE_KEY = "sd-read-pages";
const READ_STATE_EVENT = "sd:read-state-changed";

type ReadStateMap = Record<string, number>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function normalizeReadIdentifier(identifier: string | null | undefined): string | null {
  const raw = String(identifier ?? "").trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw, "https://simple-deutsch.de");
    return url.pathname.replace(/\/+$/g, "") || "/";
  } catch {
    return raw.replace(/\/+$/g, "") || "/";
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

  return Object.prototype.hasOwnProperty.call(readStateMap(), normalized);
}

export function markAsRead(identifier: string | null | undefined): boolean {
  const normalized = normalizeReadIdentifier(identifier);
  if (!normalized) {
    return false;
  }

  const current = readStateMap();
  if (Object.prototype.hasOwnProperty.call(current, normalized)) {
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
