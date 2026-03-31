/**
 * Shared utility functions used across the application.
 * Keep this module free of side effects for optimal tree-shaking.
 */

// ── Type guards ──────────────────────────────────────────────────────────

/** Narrows `T | null | undefined` to `T`. Useful as a `.filter()` callback. */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

/** Runtime check that `value` is a string. */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

// ── String utilities ─────────────────────────────────────────────────────

/**
 * Converts a human-readable string into a URL-safe slug.
 *
 * @example slugify("Hello World!") // "hello-world"
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Truncates `str` to `length` characters, appending an ellipsis if truncated.
 *
 * @example truncate("Hello World", 5) // "Hello…"
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}…`;
}

// ── Array utilities ──────────────────────────────────────────────────────

/**
 * Groups array items by a key derived from `keyFn`.
 *
 * @example groupBy([{a:1},{a:2},{a:1}], x => x.a) // Map { 1 => [{a:1},{a:1}], 2 => [{a:2}] }
 */
export function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of array) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}

/**
 * Returns a new array with duplicate values removed (by strict equality).
 *
 * @example deduplicate([1, 2, 2, 3]) // [1, 2, 3]
 */
export function deduplicate<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Splits `array` into chunks of at most `size` elements.
 *
 * @example chunkArray([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
