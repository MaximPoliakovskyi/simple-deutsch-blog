import type { Metadata } from "next";
import PartnershipsClient from "./PartnershipsClient";

const CONTACT_EMAIL = "partnerships@simple-deutsch.de";

export const metadata: Metadata = {
  title: "Partnerships | Simple Deutsch",
  description:
    "Partner with Simple Deutsch to support migrant integration in Germany through AI-driven language education and digital skills training.",
};

export default async function PartnershipsPageRoute() {
  return <PartnershipsClient contactEmail={CONTACT_EMAIL} />;
}
