"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function AnalyticsClient({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <>
      <Analytics mode="production" />
      <SpeedInsights sampleRate={0.1} />
    </>
  );
}
