import { type ReactNode, Suspense } from "react";
import PageSkeleton from "@/components/page-skeleton";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}
