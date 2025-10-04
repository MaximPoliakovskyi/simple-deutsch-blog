// app/global-error.tsx
"use client";

import "@/styles/globals.css"; // must import styles because this replaces the root layout
import StatusPage from "@/components/StatusPage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const message = isDev
    ? error.message
    : "Ein globaler Fehler ist aufgetreten. Bitte laden Sie die Seite neu.";

  return (
    <html lang="de">
      <body>
        <StatusPage
          code="Fehler"
          title="App-Fehler"
          message={message}
          actions={[
            { type: "button", onClick: () => reset(), label: "Neu laden" },
            { type: "link", href: "/", label: "Zur Startseite" },
          ]}
        >
          {!isDev && error.digest ? (
            <p className="mt-4 text-xs opacity-70">Error ID: {error.digest}</p>
          ) : null}
        </StatusPage>
      </body>
    </html>
  );
}