// src/app/api/diagnostics/env/route.ts
export const revalidate = 0;

export async function GET() {
  const hasEndpoint =
    typeof process.env.WP_GRAPHQL_ENDPOINT === "string" &&
    process.env.WP_GRAPHQL_ENDPOINT.length > 0;
  return Response.json({
    WP_GRAPHQL_ENDPOINT_present: hasEndpoint,
    // Don’t leak secrets; just show first chars to confirm
    WP_GRAPHQL_ENDPOINT_preview: hasEndpoint
      ? `${process.env.WP_GRAPHQL_ENDPOINT?.slice(0, 40)}…`
      : null,
  });
}
