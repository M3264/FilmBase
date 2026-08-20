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
  title: "FilmBase — Films, series and anime",
  description: "A clear, curated archive of movies, series and anime.",
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
