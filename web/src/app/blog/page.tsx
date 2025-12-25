import { notFound } from 'next/navigation'

export default function BlogPage() {
  // Always return 404 for /blog
  notFound()
  // The component must return something, though code is unreachable after notFound()
  return null
}
