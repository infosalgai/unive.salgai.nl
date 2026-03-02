import React from "react";
import type { Metadata, Viewport } from "next";
import { Open_Sans, Bree_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { AccessGuard } from "@/components/access-guard";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-open-sans",
});

const breeSerif = Bree_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-bree-serif",
});

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://unive.salgai.nl";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Univé | Vragenlijst Melkveehouders",
  description: "Anonieme vragenlijst voor melkveehouders over toekomstbeeld, risico's en ondersteuning. Geen persoonsgegevens, circa 10–15 minuten.",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  openGraph: {
    title: "Univé | Vragenlijst Melkveehouders",
    description: "Anonieme vragenlijst voor melkveehouders over toekomstbeeld, risico's en ondersteuning.",
    type: "website",
    images: [{ url: "/og/og-unive-melkveehouders.png", width: 1200, height: 630, alt: "Univé Vragenlijst Melkveehouders" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Univé | Vragenlijst Melkveehouders",
    description: "Anonieme vragenlijst voor melkveehouders.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Univé Vragenlijst",
  },
};

export const viewport: Viewport = {
  themeColor: "#00A651",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${openSans.variable} ${breeSerif.variable}`}>
      <body className={`${openSans.className} antialiased`}>
        <AccessGuard>
          {children}
          <Toaster />
        </AccessGuard>
      </body>
    </html>
  );
}
