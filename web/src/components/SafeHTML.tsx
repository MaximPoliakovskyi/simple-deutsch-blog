import 'server-only'
import { sanitize } from '@/lib/sanitize'

export default function SafeHTML({ html }: { html: string }) {
  const safe = sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: safe }} />
}
