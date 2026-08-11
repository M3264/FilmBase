const IMAGE_PROXY = "/api/image"
const LEGACY_IMAGE_PROXY = "https://api.filmbase.fun/api/image"

export function publicImageUrl(source?: string | null): string | null {
  if (!source) return null
  if (source.startsWith("/wp-content/")) return `${IMAGE_PROXY}?url=${encodeURIComponent(`https://9jarocks.net${source}`)}`
  try {
    const url = new URL(source)
    if (/(?:9jarocks\.net|thenkiri\.ng)$/i.test(url.hostname) && url.pathname.startsWith("/wp-content/")) {
      return `${IMAGE_PROXY}?url=${encodeURIComponent(source)}`
    }
  } catch {
    return source
  }
  return source
}

export function publicAnimeImageUrl(source?: string | null): string | null {
  if (!source) return null
  if (source.startsWith("/api/anime/")) return `https://api.filmbase.fun${source}`
  if (source.startsWith("/")) return `https://api.filmbase.fun${source}`
  return `https://api.filmbase.fun/api/anime/image-proxy?url=${encodeURIComponent(source)}`
}
