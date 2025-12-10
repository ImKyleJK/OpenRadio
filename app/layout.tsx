import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { stationConfig, stationThemeVars } from "@/lib/station-config"
import { AppProviders } from "./providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

const stationDescription = stationConfig.description || stationConfig.tagline

export const metadata: Metadata = {
  title: stationConfig.name,
  description: stationDescription,
  icons: stationConfig.logo ? { icon: stationConfig.logo } : undefined,
  openGraph: {
    title: stationConfig.name,
    description: stationDescription,
    siteName: stationConfig.name,
    images: stationConfig.logo ? [{ url: stationConfig.logo, alt: `${stationConfig.name} logo` }] : undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: stationConfig.name,
    description: stationDescription,
    images: stationConfig.logo ? [stationConfig.logo] : undefined,
  },
}

export const viewport: Viewport = {
  themeColor: stationConfig.primaryColor,
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        style={stationThemeVars as React.CSSProperties}
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
