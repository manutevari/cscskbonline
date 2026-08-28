import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "CSC Shikohabad | Ankit Tiwari CSC Center — AI Knowledge Platform",
  description:
    "Your trusted CSC center in Shikohabad (Purana Bijli Office). AI-powered guidance for government services, Ayushman, PAN, PM-KISAN, Aadhaar, certificates, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>{children}</body>
    </html>
  );
}
