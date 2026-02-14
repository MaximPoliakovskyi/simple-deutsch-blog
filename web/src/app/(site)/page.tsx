import { redirect } from "next/navigation";

export default function Page() {
  // Server-side redirect to canonical English homepage
  redirect("/en");
}
