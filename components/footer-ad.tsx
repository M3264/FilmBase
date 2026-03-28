"use client"

import Script from "next/script"

export function FooterAd() {
  return (
    <div className="mt-8 pt-8 border-t border-border flex justify-center">
      <div id="container-footer-native-banner" />
      <Script
        async
        data-cfasync="false"
        src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js"
        strategy="afterInteractive"
      />
    </div>
  )
}
