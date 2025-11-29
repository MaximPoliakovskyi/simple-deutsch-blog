// src/app/ua/[...slug]/page.tsx
// Catch-all for /ua/* — renders the homepage for now to avoid 404s.
// TODO: duplicate or map nested routes for full localized experience.
import HomePage from "../../page";

export default async function UaCatchAll() {
  return <HomePage />;
}
