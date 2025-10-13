import "server-only";
import { sanitize } from "@/lib/sanitize";

/* biome-disable */
export default function SafeHTML({ html }: { html: string }) {
  const safe = sanitize(html);
  // This HTML is sanitized server-side with DOMPurify prior to rendering.
  return <div dangerouslySetInnerHTML={{ __html: safe }} />;
}
