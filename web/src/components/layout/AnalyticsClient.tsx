"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export default function AnalyticsClient({ isProd }: { isProd: boolean }) {
  if (!isProd) return null;

  return (
    <>
      <Analytics mode="production" />
      <SpeedInsights sampleRate={0.1} />
    </>
  );
}
