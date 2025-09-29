// Lightweight GraphQL client with generics and basic error handling.

export async function fetchGraphQL<TData = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<TData> {
  if (!process.env.WP_GRAPHQL_URL) {
    throw new Error("WP_GRAPHQL_URL is not set. Define it in .env.local");
  }

  const res = await fetch(process.env.WP_GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // You can also add { next: { revalidate: 600 } } to individual fetches if needed
  });

  const json = (await res.json()) as {
    data?: TData;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    const msgs = json.errors.map((e) => e.message).join(" | ");
    throw new Error(`GraphQL errors: ${msgs}`);
  }
  if (!json.data) {
    throw new Error("GraphQL: empty response data");
  }
  return json.data;
}
