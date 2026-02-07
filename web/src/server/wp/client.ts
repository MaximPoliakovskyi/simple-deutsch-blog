import { type CachePolicy, fetchGraphQL as fetchGraphQLWithPolicy } from "@/core/api/fetching";
import { DEFAULT_LOCALE } from "@/i18n/locale";
import type { NextInit } from "@/server/wp/types";

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

  // Default to short ISR for CMS-backed content.
  return { type: "ISR", revalidate: 300, tags: ["graphql"] };
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: GraphQLOptions,
): Promise<T> {
  const endpoint =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";
  const { locale, policy, ...requestInit } = init ?? {};

  return fetchGraphQLWithPolicy<T>({
    endpoint,
    query,
    variables,
    locale: locale ?? DEFAULT_LOCALE,
    policy: policy ?? resolvePolicy(init),
    init: requestInit,
    timeoutMs: 8000,
  });
}
