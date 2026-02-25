import React from "react"
import type { Metadata, Viewport } from "next"
import { Nunito_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import "./globals.css"

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Navigatiegesprek",
  description: "Een veilige ruimte om jouw situatie te bespreken",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Navigatiegesprek",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D3182",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={nunitoSans.className}>
      <body className="antialiased">
        {children}
        <PwaInstallPrompt />
        <Analytics />
      </body>
    </html>
  )
}
