// app/error.tsx
"use client";

import StatusPage from "@/components/StatusPage";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";
  const message = isDev ? error.message : "Something went wrong. Please try again.";

  return (
    <StatusPage
      code="Error"
      title="Unexpected Error"
      message={message}
      actions={[
        { type: "button", onClick: () => reset(), label: "Try again" },
        { type: "link", href: "/", label: "Back to home" },
      ]}
    >
      {!isDev && error.digest ? (
        <p className="mt-4 text-xs opacity-70">Error ID: {error.digest}</p>
      ) : null}
    </StatusPage>
  );
}
