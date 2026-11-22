import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import GlobalAssistants from "@/components/GlobalAssistants";
import DocumentToolsShortcut from "@/components/DocumentToolsShortcut";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const devanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSC Shikohabad | Ankit Tiwari CSC Center — AI Knowledge Platform",
  description:
    "Your trusted CSC center in Shikohabad (Purana Bijli Office). AI-powered guidance for government services, Ayushman, PAN, PM-KISAN, Aadhaar, certificates, and more.",
  manifest: "/manifest.webmanifest",
  applicationName: "CSCSKB Online",
  appleWebApp: { capable: true, title: "CSCSKB", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${devanagari.variable}`}>
      <head>
        <meta name="google-adsense-account" content="ca-pub-9259849546872526" />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9259849546872526"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <>
            <Script
              src={"https://www.googletagmanager.com/gtag/js?id=" + process.env.NEXT_PUBLIC_GA_ID}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        ) : null}
        {children}
        <GlobalAssistants />
        <DocumentToolsShortcut />
      </body>
    </html>
  );
}
