/**
 * Consent management — single source of truth for cookie / storage consent.
 *
 * Categories:
 *   necessary   — always active (locale cookie, scroll restoration)
 *   preferences — sd-theme (theme), sd-read-pages (read progress)
 *   analytics   — not currently used, reserved for future
 *   marketing   — not currently used, reserved for future
 */

export const CONSENT_KEY = "sd-consent";
export const CONSENT_CHANGE_EVENT = "sd:consent-changed";
export const CONSENT_OPEN_EVENT = "sd:consent-open";

export type ConsentCategories = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  v: 1;
  categories: ConsentCategories;
  ts: number;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readConsent(): ConsentRecord | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;
    const record = parsed as ConsentRecord;
    if (record.v !== 1 || typeof record.ts !== "number") return null;
    return record;
  } catch {
    return null;
  }
}

export function writeConsent(categories: Omit<ConsentCategories, "necessary">): void {
  if (!canUseStorage()) return;
  const record: ConsentRecord = {
    v: 1,
    categories: { necessary: true, ...categories },
    ts: Date.now(),
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  } catch {}
}

export function hasConsent(category: Exclude<keyof ConsentCategories, "necessary">): boolean {
  const record = readConsent();
  if (!record) return false;
  return record.categories[category] === true;
}

export function hasInteracted(): boolean {
  return readConsent() !== null;
}

/** Dispatches an event that the CookieConsent component listens to in order to reopen the modal. */
export function openConsentModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  }
}
