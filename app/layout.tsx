import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingOverlay } from "@/components/loading-overlay"
import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://filmbase.fun"),
  title: { default: "FilmBase — Films, series and anime", template: "%s — FilmBase" },
  description: "A clear, curated archive of movies, series and anime.",
  alternates: { canonical: "/" },
  openGraph: { siteName: "FilmBase", type: "website", url: "/", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "FilmBase movie archive" }] },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
  applicationName: "FilmBase",
  appleWebApp: { capable: true, title: "FilmBase", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffb22f",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <PwaRegister />
          <LoadingOverlay />
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
