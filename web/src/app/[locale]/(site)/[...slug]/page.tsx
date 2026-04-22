import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string[] }>;
};

export default async function CatchAllRoute(_props: Props) {
  notFound();
}
