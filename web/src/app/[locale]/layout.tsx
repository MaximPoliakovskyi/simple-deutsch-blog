import type { ReactNode } from "react";
import ChromeExtrasDeferred from "@/components/chrome-extras-deferred";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { LocaleProvider } from "@/components/providers";
import { getRequiredRouteLocale } from "./locale-route";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleRootLayout({ children, params }: Props) {
  const { locale } = await params;
  const validated = getRequiredRouteLocale(locale);

  return (
    <LocaleProvider locale={validated}>
      <Header />
      <ChromeExtrasDeferred />
      <main className="mt-8 md:mt-12">{children}</main>
      <Footer locale={validated} />
    </LocaleProvider>
  );
}
