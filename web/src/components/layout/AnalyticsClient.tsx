"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Lazy load analytics to avoid blocking critical path
const Analytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics), {
  ssr: false,
});

const SpeedInsights = dynamic(
  () => import("@vercel/speed-insights/react").then((m) => m.SpeedInsights),
  {
    ssr: false,
  },
);

export default function AnalyticsClient({ isProd }: { isProd: boolean }) {
  if (!isProd) return null;

  return (
    <>
      <Suspense fallback={null}>
        <Analytics mode="production" />
      </Suspense>
      <Suspense fallback={null}>
        <SpeedInsights sampleRate={0.1} />
      </Suspense>
    </>
  );
}
