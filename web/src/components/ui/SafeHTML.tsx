import "server-only";
import { sanitize } from "@/core/content/sanitize";

export default function SafeHTML({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}
