import "server-only";

import { DEFAULT_LOCALE, type Locale } from "@/i18n/locale";

export type NextFetchInit = RequestInit & {
  next?: {
    revalidate?: number;
    tags?: string[];
  };
};

export type CachePolicy =
  | { type: "STATIC"; tags?: string[] }
  | { type: "ISR"; revalidate: number; tags?: string[] }
  | { type: "DYNAMIC" };

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
  if (policy.type === "STATIC") {
    return { ...policy, tags: mergedTags };
  }

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
    if (error instanceof Error && error.name === "AbortError" && timeoutTriggered && !requestWasAborted) {
      throw new Error(`Request timed out after ${timeoutMs}ms for ${String(input)}`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    mergedSignal.cleanup();
  }
}

export async function fetchGraphQL<T>(options: {
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
