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
  // Optional: log to your observability tool
  useEffect(() => {
    // console.error(error);
  }, [error]);

  // Hide raw error in production; show digest if available
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev
    ? error.message
    : "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.";

  return (
    <StatusPage
      code="Fehler"
      title="Unerwarteter Fehler"
      message={message}
      actions={[
        { type: "button", onClick: () => reset(), label: "Erneut versuchen" },
        { type: "link", href: "/", label: "Zur Startseite" },
      ]}
    >
      {!isDev && error.digest ? (
        <p className="mt-4 text-xs opacity-70">Fehler-ID: {error.digest}</p>
      ) : null}
    </StatusPage>
  );
}
