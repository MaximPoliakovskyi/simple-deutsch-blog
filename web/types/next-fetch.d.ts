// web/types/next-fetch.d.ts
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_WP_GRAPHQL_ENDPOINT?: string;
      WP_GRAPHQL_ENDPOINT?: string;
      NEXT_PUBLIC_BASE_URL?: string;
      NEXT_PUBLIC_SITE_URL?: string;
      VERCEL_URL?: string;
    }
  }
}
