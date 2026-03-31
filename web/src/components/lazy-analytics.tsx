"use client";

import dynamic from "next/dynamic";

const AnalyticsClient = dynamic(
  () => import("@/components/chrome-extras").then((m) => ({ default: m.AnalyticsClient })),
  { ssr: false },
);

export function LazyAnalyticsClient({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return <AnalyticsClient enabled={enabled} />;
}
