// src/lib/wp/client.ts

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
        `Set it in web/.env.local, e.g. WP_GRAPHQL_ENDPOINT=https://cms.simple-deutsch.de/graphql`
    );
  }
  return v; // <- typed as string
}

const ENDPOINT: string = requireEnv('WP_GRAPHQL_ENDPOINT');

type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: RequestInit & { next?: { revalidate?: number } }
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 600, ...(init?.next ?? {}) },
    ...init,
  });

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    const msgs = json.errors.map(e => e.message).join(' | ');
    throw new Error(`GraphQL errors: ${msgs}`);
  }
  if (!json.data) throw new Error('GraphQL: empty response data');
  return json.data;
}
