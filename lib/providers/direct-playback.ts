const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mkv: "video/x-matroska",
}

// Eligibility to attempt native playback, not a guarantee of codec support.
// Bare file-host links carry no extension; their media type is learned from
// the upstream response at watch time instead of being guessed here.
export function directPlaybackSource(value: string): { url: URL; contentType: string | null; requiresResolution: boolean } | null {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const loaded = host === "loadedfiles.net" || host.endsWith(".loadedfiles.net")
    const downloadwella = host === "downloadwella.com" || host.endsWith(".downloadwella.com")
    if (url.protocol !== "https:" || url.username || url.password || (!loaded && !downloadwella)) return null
    const requiresResolution = downloadwella && /\.html$/i.test(url.pathname)
    const filename = requiresResolution ? url.pathname.replace(/\.html$/i, "") : url.pathname
    const extension = filename.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || ""
    // Extensionless file-host links are eligible; the media type is learned
    // from the upstream response. A wrapper page without a media filename
    // (e.g. an ad or landing page) stays download-only.
    if (!extension) return requiresResolution ? null : { url, contentType: null, requiresResolution: false }
    const contentType = VIDEO_TYPES[extension]
    if (!contentType) return null
    return { url, contentType, requiresResolution }
  } catch { return null }
}

// Learn the media type from a real upstream response. Never trust a bare
// link's missing extension, and never serve HTML as playable video.
export function inferUpstreamContentType(contentTypeHeader: string | null, contentDisposition: string | null): string | null {
  const declared = (contentTypeHeader || "").split(";")[0].trim().toLowerCase()
  if (declared.startsWith("video/")) return declared
  const filename = /filename="?([^";]+)"?/i.exec(contentDisposition || "")?.[1] || ""
  const extension = filename.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || ""
  return VIDEO_TYPES[extension] || null
}

export function directWatchUrl(path: string, offerUrl: string, index: number): string | undefined {
  if (!directPlaybackSource(offerUrl)) return undefined
  return `/api/watch?${new URLSearchParams({ path, offer: String(index) })}`
}
