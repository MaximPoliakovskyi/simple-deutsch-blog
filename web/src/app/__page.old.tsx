// Renamed root page to disable App Router route handling.
// Do NOT import this file; it exists only to preserve the original
// module contents while preventing Next from treating it as `page.*`.

export default async function Page() {
  // Should never be reached because middleware redirects `/` to `/en`.
  return null;
}
