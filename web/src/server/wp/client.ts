type NextInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: NextInit,
): Promise<T> {
  const endpoint =
    process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? "https://cms.simple-deutsch.de/graphql";
  const defaultInit: NextInit = { next: { revalidate: 600 } };
  const finalInit = { ...defaultInit, ...init, next: { ...defaultInit.next, ...init?.next } };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    ...finalInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    throw new Error(`GraphQL errors: ${json.errors.map((e) => e.message).join(" | ")}`);
  }
  if (!json.data) throw new Error("GraphQL: empty response data");
  return json.data;
}
