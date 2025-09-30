// src/lib/wp/client.ts
type NextInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

function mergeFetchInit(defaults: NextInit, overrides?: NextInit): NextInit {
  const merged: NextInit = {
    ...defaults,
    ...overrides,
    next: { ...(defaults.next ?? {}), ...(overrides?.next ?? {}) },
  };

  // If both cache:'no-store' and next.revalidate are present, remove revalidate
  // (or you could remove 'cache' instead — the key point is: not both).
  if (merged.cache === 'no-store' && typeof merged.next?.revalidate === 'number') {
    if (merged.next) delete merged.next.revalidate;
  }

  // If revalidate === 0 is set, don't also set cache:'no-store'
  if (typeof merged.next?.revalidate === 'number' && merged.next.revalidate === 0 && merged.cache === 'no-store') {
    delete (merged as any).cache;
  }

  return merged;
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  init?: NextInit
): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT ?? 'https://cms.simple-deutsch.de/graphql';

  // Project-wide default (example): revalidate every 600s unless overridden.
  const defaultInit: NextInit = { next: { revalidate: 600 } };

  const finalInit = mergeFetchInit(defaultInit, init);

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    ...finalInit,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GraphQL HTTP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) {
    const msgs = json.errors.map((e) => e.message).join(' | ');
    throw new Error(`GraphQL errors: ${msgs}`);
  }
  if (!json.data) throw new Error('GraphQL: empty response data');
  return json.data;
}