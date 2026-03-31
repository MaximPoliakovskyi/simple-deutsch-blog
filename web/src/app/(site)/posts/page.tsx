import { DEFAULT_LOCALE } from "@/lib/i18n";
import PostsIndex from "../../[locale]/posts/posts-index";

export default async function Page() {
  return <PostsIndex locale={DEFAULT_LOCALE} />;
}
