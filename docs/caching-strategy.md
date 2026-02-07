# Caching Strategy

## Cache Classes

1. **STATIC** (`cache: "force-cache"`)
   - Use for content that is effectively immutable during deploy windows.
   - Example: reference datasets that do not change frequently.

2. **ISR(revalidate=N)** (`next: { revalidate: N }`)
   - Use for CMS-backed content that can be slightly stale.
   - Example: posts list pages, category/tag feeds.

3. **DYNAMIC(no-store)** (`cache: "no-store"` + `revalidate: 0`)
   - Use for request-time freshness requirements.
   - Example: search results and other query/user-specific responses.

## Locale Safety Rule

- **Every cached server request must include locale in the cache identity.**
- In this codebase, server fetch wrappers attach locale to request headers and locale-scoped cache tags.
- Locale must be passed explicitly from route/component call sites (do not rely on pathname inference in server data functions).

## Examples

- **Posts list (`getPostsIndex`, `getPosts`)**  
  Use **ISR(300)** with explicit locale to keep TTFB low and prevent cross-locale cache leakage.

- **Post detail (`getPostBySlug`)**  
  Use **ISR(120)** with explicit locale; metadata and page rendering share request-scoped memoization with locale in arguments.

- **Search (`searchPosts`)**  
  Use **DYNAMIC(no-store)** because query + locale combinations are highly variable and must always be fresh.
