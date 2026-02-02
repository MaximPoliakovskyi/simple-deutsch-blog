// Disabled root page — renamed to prevent Next App Router from mapping `/`.
// Original filename: page.tsx

export default async function PageDisabled() {
  // Intentionally inert. Middleware handles `/`.
  return null;
}
