import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap-reboot.min.css";
import "bootstrap/dist/css/bootstrap-grid.min.css";
import "bootstrap/dist/css/bootstrap-utilities.min.css";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HtmlSnippet } from "@/components/HtmlSnippet";
import { getAllCategories, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/site";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-baloo", display: "swap" });
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const revalidate = 3600;

export const viewport: Viewport = {
  themeColor: "#FDF6EC",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const other: Record<string, string> = {};
  if (s.pinterestVerification) other["p:domain_verify"] = s.pinterestVerification;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: s.siteTitle, template: s.titleTemplate?.includes("%title%") ? s.titleTemplate.replace("%title%", "%s").replace("%site%", s.siteTitle) : `%s | ${s.siteTitle}` },
    description: s.defaultMetaDescription || s.tagline,
    applicationName: s.siteTitle,
    icons: s.favicon?.url ? { icon: s.favicon.url, apple: s.favicon.url } : undefined,
    verification: s.searchConsoleVerification ? { google: s.searchConsoleVerification } : undefined,
    other,
    openGraph: { siteName: s.siteTitle, locale: "en_US" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getAllCategories()]);
  const ga = settings.ga4Id?.trim();

  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header settings={settings} categories={categories} />
        <main id="main">{children}</main>
        <Footer settings={settings} categories={categories} />

        {ga && /^G-[A-Z0-9]+$/i.test(ga) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
        {settings.ads.headScript && <HtmlSnippet html={settings.ads.headScript} target="head" />}
      </body>
    </html>
  );
}
