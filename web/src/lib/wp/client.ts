import 'server-only' // Next: server-only module guard. https://nextjs.org/docs/app/api-reference/functions/fetch

// ---- Types
type GraphQLError = { message: string }
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] } // TS type alias. https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-aliases

export type FetchOptions = {
  next?: { revalidate?: number; tags?: string[] } // Next.js extends fetch with `next`. https://nextjs.org/docs/app/api-reference/functions/fetch
  cache?: RequestCache
}

// ---- Env
const WP_ENDPOINT = process.env.WP_GRAPHQL_URL
if (!WP_ENDPOINT) {
  throw new Error('Missing WP_GRAPHQL_URL in environment')
}

// ---- Client
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: FetchOptions = {}
): Promise<T> {
  const res = await fetch(WP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: opts.cache,
    next: opts.next,
  })

  if (!res.ok) {
    throw new Error(`GraphQL HTTP error ${res.status}`)
  }

  const json: GraphQLResponse<T> = await res.json()
  if (json.errors?.length) {
    // Type the callback param to avoid implicit any.
    const msgs = json.errors.map((e: GraphQLError) => e.message).join(' | ')
    throw new Error(`GraphQL errors: ${msgs}`)
  }
  if (!json.data) {
    throw new Error('GraphQL: empty response data')
  }
  return json.data
}
