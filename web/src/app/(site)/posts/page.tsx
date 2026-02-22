import { DEFAULT_LOCALE } from "@/i18n/locale";
import PostsIndex from "./PostsIndex";

export default async function Page() {
  // Proxy is the source of truth for locale redirects.
  // Keep a deterministic fallback if proxy is bypassed in some environments.
  return <PostsIndex locale={DEFAULT_LOCALE} />;
}
