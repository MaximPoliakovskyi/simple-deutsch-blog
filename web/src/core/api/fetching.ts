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

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = new Headers(options.init?.headers);
    headers.set(LOCALE_HEADER, locale);

    const response = await fetch(input, {
      ...options.init,
      ...policyInit,
      next: mergeNext(policyInit.next, options.init?.next),
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`HTTP ${response.status} for ${String(input)}: ${body}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeoutId);
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
