"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"

/**
 * FilmBase's publisher tags. These are intentionally loaded after hydration so
 * they never delay the catalogue or block the first CSS paint.
 */
export function AdNetwork() {
  const pathname = usePathname()
  if (pathname.startsWith("/watch") || pathname === "/movie/local-spider-man-brand-new-day-2026") return null
  return (
    <>
      <Script
        src="https://quge5.com/88/tag.min.js"
        data-zone="266788"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <Script
        src="https://quge5.com/88/tag.min.js"
        data-zone="223721"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <Script id="filmbase-vignette-11499904" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11499904',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))}`}
      </Script>
      <Script id="filmbase-vignette-11499900" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11499900',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))}`}
      </Script>
    </>
  )
}
