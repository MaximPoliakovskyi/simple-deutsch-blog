import "server-only";
import { sanitize } from "@/core/content/sanitize";

type Props = { html: string };

export default function SafeHTML({ html }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: sanitize(html) }} />;
}
