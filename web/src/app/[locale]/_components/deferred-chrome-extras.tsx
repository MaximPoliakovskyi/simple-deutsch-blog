"use client";

import dynamic from "next/dynamic";

const FirstVisitDisclaimer = dynamic(() => import("./first-visit-disclaimer"), {
  ssr: false,
});

const BackButton = dynamic(() => import("./back-button"), {
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
