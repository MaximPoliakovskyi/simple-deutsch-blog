"use client";

import dynamic from "next/dynamic";

const DeferredChromeExtras = dynamic(() => import("./chrome-extras"), {
  ssr: false,
});

export default function ChromeExtrasDeferred() {
  return <DeferredChromeExtras />;
}
