"use client";

import dynamic from "next/dynamic";

const FirstVisitDisclaimer = dynamic(() => import("@/components/layout/FirstVisitDisclaimer"), {
  ssr: false,
});

const BackButton = dynamic(() => import("@/components/ui/BackButton"), {
  ssr: false,
});

export default function DeferredChromeExtras() {
  return (
    <>
      <FirstVisitDisclaimer />
      <BackButton />
    </>
  );
}
