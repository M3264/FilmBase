"use server"

import { getTitleOffers, resolveSourceOffer } from "@/lib/api"

export async function prepareTitleOffer(titlePath: string, offerIndex: number) {
  try {
    const offers = await getTitleOffers(titlePath)
    const offer = offers[offerIndex]
    if (!offer) return { success: false as const, message: "This offer is no longer available." }

    if (offer.provider === "local") {
      return {
        success: true as const,
        url: "/media/Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4",
        externalHost: "media.filmbase.fun",
        autoDownload: true as const,
        fileName: "Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4",
      }
    }

    // Keep the original loadedfiles offer behind API2's streaming endpoint.
    // That endpoint performs the resolver work server-side and responds with
    // Content-Disposition: attachment, so the browser starts the download on
    // the first click without exposing an intermediate redirect or ad host.
    let offerHost = ""
    try { offerHost = new URL(offer.url).hostname.toLowerCase() } catch { /* resolved below */ }
    if (offerHost === "loadedfiles.net" || offerHost.endsWith(".loadedfiles.net")) {
      const apiBase = process.env.FILMBASE_API2_URL || "https://api2.filmbase.fun"
      return {
        success: true as const,
        url: `${apiBase.replace(/\/$/, "")}/api/download-file?url=${encodeURIComponent(offer.url)}`,
        externalHost: "loadedfiles.net",
        autoDownload: true as const,
      }
    }

    const result = await resolveSourceOffer(offer)
    return { success: true as const, url: result.url, externalHost: result.externalHost }
  } catch {
    return { success: false as const, message: "This source could not be prepared. Please try another offer." }
  }
}
