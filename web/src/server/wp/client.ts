type NextInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

type GraphQLResponse<T> = { data?: T; errors?: Array<{ message: string }> };

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: NextInit,
): Promise<T> {
  const endpoint =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";

  // Aggressive caching by default for better TTFB
  const defaultInit: NextInit =
    init?.cache === "no-store" ? {} : { next: { revalidate: 3600, tags: ["graphql"] } };
  const mergedNext = { ...defaultInit.next, ...init?.next };
  const finalInit = { ...defaultInit, ...init, next: mergedNext };

  // Add timeout to prevent hanging requests (8s timeout for GraphQL)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
      ...finalInit,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
    }

    const json = (await res.json()) as GraphQLResponse<T>;
    if (json.errors?.length) {
      throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join(" | ")}`);
    }
    if (!json.data) throw new Error("GraphQL: empty response data");
    return json.data;
  } finally {
    clearTimeout(timeoutId);
  }
}
