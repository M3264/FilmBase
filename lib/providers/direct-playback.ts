const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mkv: "video/x-matroska",
}

// Eligibility to attempt native playback, not a guarantee of codec support.
export function directPlaybackSource(value: string): { url: URL; contentType: string } | null {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || ""
    const contentType = VIDEO_TYPES[extension]
    if (url.protocol !== "https:" || url.username || url.password || (host !== "loadedfiles.net" && !host.endsWith(".loadedfiles.net")) || !contentType) return null
    return { url, contentType }
  } catch { return null }
}

export function directWatchUrl(path: string, offerUrl: string, index: number): string | undefined {
  if (!directPlaybackSource(offerUrl)) return undefined
  return `/api/watch?${new URLSearchParams({ path, offer: String(index) })}`
}
