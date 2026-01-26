import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("site_locale")?.value ?? "en";
  
  // Redirect to locale-specific posts page
  redirect(`/${locale}/posts`);
}
