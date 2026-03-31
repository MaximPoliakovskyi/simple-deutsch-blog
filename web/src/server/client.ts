import "server-only";

import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import type { NextInit } from "@/server/types";

// --- Cache policy types & helpers ---

export type CachePolicy =
  | { type: "STATIC"; tags?: string[] }
  | { type: "ISR"; revalidate: number; tags?: string[] }
  | { type: "DYNAMIC" };

type NextFetchInit = RequestInit & {
  next?: { revalidate?: number; tags?: string[] };
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const LOCALE_HEADER = "x-simple-deutsch-locale";

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function normalizeLocale(locale?: Locale | null): string {
  return locale ?? DEFAULT_LOCALE;
}

/**
 * Makes a locale-aware cache key for Next.js fetch tag-based revalidation.
 * @example makeLocaleCacheKey("posts", "ru", ["category", "grammar"]) // "posts:locale:ru:category:grammar"
 */
export function makeLocaleCacheKey(
  scope: string,
  locale: Locale | string | null | undefined,
  parts: Array<string | number | boolean | null | undefined> = [],
): string {
  const normalizedLocale = normalizeLocale((locale as Locale | null | undefined) ?? DEFAULT_LOCALE);
  const stableParts = parts.map((part) => String(part ?? ""));
  return [scope, `locale:${normalizedLocale}`, ...stableParts].join(":");
}

function withLocaleTags(
  policy: CachePolicy,
  locale: Locale | string | null | undefined,
  scope: string,
): CachePolicy {
  const localeTag = makeLocaleCacheKey(scope, locale);
  if (policy.type === "DYNAMIC") return policy;
  const mergedTags = unique([scope, localeTag, ...(policy.tags ?? [])]);
  return { ...policy, tags: mergedTags };
}

function policyToInit(policy: CachePolicy): Pick<NextFetchInit, "cache" | "next"> {
  if (policy.type === "DYNAMIC") {
    return { cache: "no-store", next: { revalidate: 0 } };
  }
  if (policy.type === "STATIC") {
    return {
      cache: "force-cache",
      next: policy.tags?.length ? { tags: policy.tags } : undefined,
    };
  }
  return {
    cache: "force-cache",
    next: {
      revalidate: policy.revalidate,
      ...(policy.tags?.length ? { tags: policy.tags } : {}),
    },
  };
}

function mergeNext(
  left?: NextFetchInit["next"],
  right?: NextFetchInit["next"],
): NextFetchInit["next"] {
  if (!left && !right) return undefined;
  const revalidate = right?.revalidate ?? left?.revalidate;
  const tags = unique([...(left?.tags ?? []), ...(right?.tags ?? [])]);
  return {
    ...(revalidate !== undefined ? { revalidate } : {}),
    ...(tags.length ? { tags } : {}),
  };
}

function mergeSignals(
  timeoutSignal: AbortSignal,
  requestSignal?: AbortSignal | null,
): { signal: AbortSignal; cleanup: () => void } {
  if (!requestSignal) {
    return { signal: timeoutSignal, cleanup: () => {} };
  }
  if (typeof AbortSignal.any === "function") {
    return { signal: AbortSignal.any([requestSignal, timeoutSignal]), cleanup: () => {} };
  }
  const controller = new AbortController();
  const onTimeoutAbort = () => controller.abort(timeoutSignal.reason);
  const onRequestAbort = () => controller.abort(requestSignal.reason);
  if (timeoutSignal.aborted) onTimeoutAbort();
  else timeoutSignal.addEventListener("abort", onTimeoutAbort, { once: true });
  if (requestSignal.aborted) onRequestAbort();
  else requestSignal.addEventListener("abort", onRequestAbort, { once: true });
  return {
    signal: controller.signal,
    cleanup: () => {
      timeoutSignal.removeEventListener("abort", onTimeoutAbort);
      requestSignal.removeEventListener("abort", onRequestAbort);
    },
  };
}

/**
 * Generic JSON fetch with locale header, timeout handling, and Next.js cache policy support.
 * All GraphQL fetches go through this function.
 */
export async function fetchJson<T>(
  input: string | URL,
  options: {
    locale?: Locale;
    policy: CachePolicy;
    init?: NextFetchInit;
    timeoutMs?: number;
    scopeTag?: string;
  },
): Promise<T> {
  const locale = normalizeLocale(options.locale);
  const scope = options.scopeTag ?? "fetch";
  const policyWithLocale = withLocaleTags(options.policy, locale, scope);
  const policyInit = policyToInit(policyWithLocale);
  const timeoutController = new AbortController();
  const mergedSignal = mergeSignals(timeoutController.signal, options.init?.signal);
  const timeoutMs = options.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    const headers = new Headers(options.init?.headers);
    headers.set(LOCALE_HEADER, locale);
    const response = await fetch(input, {
      ...options.init,
      ...policyInit,
      next: mergeNext(policyInit.next, options.init?.next),
      headers,
      signal: mergedSignal.signal,
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} for ${String(input)}: ${body}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    const requestWasAborted = options.init?.signal?.aborted ?? false;
    const timeoutTriggered = timeoutController.signal.aborted;
    if (
      error instanceof Error &&
      error.name === "AbortError" &&
      timeoutTriggered &&
      !requestWasAborted
    ) {
      throw new Error(`Request timed out after ${timeoutMs}ms for ${String(input)}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    mergedSignal.cleanup();
  }
}

async function fetchGraphQLRaw<T>(options: {
  endpoint: string;
  query: string;
  variables?: Record<string, unknown>;
  locale?: Locale;
  policy: CachePolicy;
  init?: NextFetchInit;
  timeoutMs?: number;
}): Promise<T> {
  const json = await fetchJson<GraphQLResponse<T>>(options.endpoint, {
    locale: options.locale,
    policy: options.policy,
    timeoutMs: options.timeoutMs,
    scopeTag: "graphql",
    init: {
      ...options.init,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.init?.headers ?? {}),
      },
      body: JSON.stringify({
        query: options.query,
        variables: options.variables ?? {},
      }),
    },
  });
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${json.errors.map((error) => error.message).join(" | ")}`);
  }
  if (!json.data) {
    throw new Error("GraphQL: empty response data");
  }
  return json.data;
}

// --- Public API ---

type GraphQLOptions = NextInit;

function resolvePolicy(init?: GraphQLOptions): CachePolicy {
  if (init?.policy) return init.policy;
  if (init?.cache === "no-store" || init?.next?.revalidate === 0) {
    return { type: "DYNAMIC" };
  }
  if (init?.cache === "force-cache") {
    return { type: "STATIC", tags: init.next?.tags };
  }
  if (typeof init?.next?.revalidate === "number") {
    return { type: "ISR", revalidate: init.next.revalidate, tags: init.next?.tags };
  }
  return { type: "ISR", revalidate: 300, tags: ["graphql"] };
}

/**
 * Executes a GraphQL query against the WordPress endpoint.
 * Defaults to ISR (300s revalidate) if no cache policy is specified.
 */
export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: GraphQLOptions,
): Promise<T> {
  const endpoint =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";
  const { locale, policy, ...requestInit } = init ?? {};

  return fetchGraphQLRaw<T>({
    endpoint,
    query,
    variables,
    locale: locale ?? DEFAULT_LOCALE,
    policy: policy ?? resolvePolicy(init),
    init: requestInit,
    timeoutMs: 8000,
  });
}
