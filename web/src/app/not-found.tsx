// app/not-found.tsx
import StatusPage from "@/components/StatusPage";
import Link from "next/link";

export const metadata = {
  title: "Seite nicht gefunden — Simple Deutsch",
  robots: { index: false }, // Next.js also injects noindex for 404 automatically
};

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Seite nicht gefunden"
      message="Die angeforderte Seite existiert nicht oder wurde verschoben."
      actions={[
        { type: "link", href: "/", label: "Zur Startseite" },
        { type: "link", href: "/search", label: "Beiträge durchsuchen" },
      ]}
    >
      <p className="sr-only">
        Fehler 404: Diese Seite wurde nicht gefunden. Bitte versuchen Sie eine andere URL.
      </p>
      {/* Tip for editors/users */}
      <p className="text-xs opacity-70 mt-6">
        Wenn Sie gerade einem alten Link gefolgt sind, versuchen Sie die Suche.
      </p>
    </StatusPage>
  );
}
