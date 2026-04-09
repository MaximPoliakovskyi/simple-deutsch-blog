import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolvePreferredLocale } from "@/lib/request-locale";

// Fallback for the root URL in case middleware does not run for a given request.
export default async function RootPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolvePreferredLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value ?? cookieStore.get("locale")?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });

  redirect(`/${locale}`);
}
