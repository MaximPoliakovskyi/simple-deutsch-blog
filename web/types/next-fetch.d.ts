// web/types/env.d.ts
export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      WP_GRAPHQL_URL: string
    }
  }
}