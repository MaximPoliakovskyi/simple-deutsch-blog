import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// Fallback for the root URL in case middleware doesn't run.
// Under normal operation middleware handles / → /en first.
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
