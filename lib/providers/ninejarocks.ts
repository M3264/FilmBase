import {
  inferContentType,
  latestEpisode,
  titleStatus,
  titleYear,
  type CatalogTitle,
  type SourceOffer,
} from "@/lib/domain/catalog"
import { fetchJson } from "@/lib/providers/http"

export const NINEJAROCKS_URL = process.env.FILMBASE_API2_URL || "https://api2.filmbase.fun"

export interface NinejaMovie {
  id: string | number
  title: string
  url: string
  thumbnail?: string
  description?: string
  date_posted?: string
  is_trending?: number
  category?: string
  section?: string
}

export interface NinejaDetail {
  title: string
  description?: string
  thumbnail?: string
  download_links?: Array<{ url: string; text?: string; label?: string }>
  screenshots?: string[]
  rating?: number
  quality?: string
  language?: string | null
  cast?: string[]
  date_posted?: string
  url?: string
}

export async function ninejaHome(): Promise<Array<{ name: string; label: string; movies: NinejaMovie[] }>> {
  const data = await fetchJson<{ sections?: Array<{ name: string; label: string; movies: NinejaMovie[] }> }>(
    `${NINEJAROCKS_URL}/api/homepage?artwork=2`,
    { next: { revalidate: 900 }, provider: "ninejarocks" },
  )
  return data.sections || []
}

export async function ninejaSearch(query: string): Promise<NinejaMovie[]> {
  const data = await fetchJson<{ movies?: NinejaMovie[] }>(
    `${NINEJAROCKS_URL}/api/search?q=${encodeURIComponent(query)}`,
    { next: { revalidate: 300 }, provider: "ninejarocks" },
  )
  return (data.movies || []).filter((movie) => meaningfulMatch(query, movie.title))
}

export async function ninejaCategory(slug: string): Promise<NinejaMovie[]> {
  const data = await fetchJson<{ movies?: NinejaMovie[] }>(
    `${NINEJAROCKS_URL}/api/category/${encodeURIComponent(slug)}`,
    { next: { revalidate: 900 }, provider: "ninejarocks" },
  )
  return data.movies || []
}

export interface NinejaMovieFeed {
  movies?: NinejaMovie[]
  page?: number
  total_pages?: number
  total?: number
  has_next?: boolean
}

export async function ninejaDiscoveryFeed(
  kind: "latest" | "trending" | "staff-pick",
): Promise<NinejaMovie[]> {
  const data = await fetchJson<NinejaMovieFeed>(`${NINEJAROCKS_URL}/api/${kind}`, {
    next: { revalidate: kind === "latest" ? 300 : 1800 },
    provider: "ninejarocks",
  })
  return data.movies || []
}

export async function ninejaCategoryPage(slug: string, page = 1): Promise<NinejaMovieFeed> {
  return fetchJson<NinejaMovieFeed>(
    `${NINEJAROCKS_URL}/api/category/${encodeURIComponent(slug)}?page=${page}`,
    { next: { revalidate: 900 }, provider: "ninejarocks" },
  )
}

export async function ninejaAlphabetical(letter: string): Promise<NinejaMovie[]> {
  const data = await fetchJson<NinejaMovieFeed>(
    `${NINEJAROCKS_URL}/api/a-z?letter=${encodeURIComponent(letter)}`,
    { next: { revalidate: 21600 }, provider: "ninejarocks" },
  )
  return data.movies || []
}

export async function ninejaCategories(): Promise<Array<{ slug: string; label: string }>> {
  return fetchJson(`${NINEJAROCKS_URL}/api/categories`, {
    next: { revalidate: 3600 },
    provider: "ninejarocks",
  })
}

export async function ninejaDetail(id: string): Promise<NinejaDetail> {
  return fetchJson(`${NINEJAROCKS_URL}/api/movie/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
    provider: "ninejarocks",
  })
}

export function normalizeNinejaMovie(movie: NinejaMovie): CatalogTitle {
  const id = String(movie.id)
  const type = inferContentType(movie.title, `${movie.category || ""} ${movie.section || ""}`)
  return {
    id: `ninejarocks:${id}`,
    slug: movie.url || id,
    type,
    title: movie.title.trim(),
    year: titleYear(movie.title),
    imageUrl: movie.thumbnail || null,
    backdropUrl: movie.thumbnail || null,
    synopsis: cleanDescription(movie.description),
    genres: [],
    countries: /nollywood/i.test(`${movie.title} ${movie.category}`) ? ["Nigeria"] : [],
    languages: [],
    rating: null,
    runtime: null,
    tmdbId: null,
    tmdbType: null,
    tagline: null,
    cast: [],
    director: null,
    releaseDate: movie.date_posted || null,
    status: titleStatus(movie.title),
    latestEpisode: latestEpisode(movie.title),
    date: movie.date_posted || null,
    providers: [{ provider: "ninejarocks", id, path: movie.url || id }],
  }
}

export function normalizeNinejaDetail(id: string, detail: NinejaDetail): CatalogTitle {
  const artwork = detail.screenshots?.[0] || detail.thumbnail || null
  return {
    ...normalizeNinejaMovie({
      id,
      title: detail.title,
      url: detail.url || id,
      thumbnail: detail.thumbnail,
      description: detail.description,
      date_posted: detail.date_posted,
    }),
    rating: typeof detail.rating === "number" ? detail.rating : null,
    languages: detail.language ? [detail.language] : [],
    imageUrl: artwork,
    backdropUrl: artwork,
  }
}

export function ninejaOffers(id: string, detail: NinejaDetail): SourceOffer[] {
  const links = detail.download_links || []
  const isSeriesPack = inferContentType(detail.title) === "series" && links.length > 1
  const available = links
    .map((link, index) => ({ link, index }))
    .filter(({ link }) => isRealDownloadLink(link) && !isKnownUnavailableOffer(link.url))
  return available.map<SourceOffer>(({ link, index }) => {
    const host = safeHost(link.url)
    const file = decodeURIComponent(link.url.split("/").pop() || "")
    const label = (link.label || link.text || `Download server ${index + 1}`).replace(/\s+/g, " ").trim()
    const identity = `${label} ${file}`
    const labeledEpisode = numberMatch(label, /e(?:pisode)?\s*0*(\d+)/i)
    return {
      id: `ninejarocks:${id}:${index}`,
      provider: "ninejarocks",
      label,
      url: link.url,
      season: numberMatch(identity, /s(?:eason)?\s*0*(\d+)/i),
      episode: labeledEpisode ?? (isSeriesPack ? index + 1 : null),
      quality: detail.quality || firstMatch(file, /\b(2160p|1080p|720p|540p|480p|360p)\b/i),
      container: firstMatch(file, /\.(mkv|mp4|avi|webm)(?:\?|$)/i),
      codec: firstMatch(file, /\b(x265|x264|hevc|av1)\b/i),
      size: firstMatch(detail.description || "", /filesize\s*:\s*([^\n\r]+?)(?:duration|cast|download|$)/i),
      audio: null,
      subtitles: /subtitle\s*:\s*english/i.test(detail.description || "") ? ["English"] : [],
      externalHost: host,
      lastVerifiedAt: null,
    }
  })
}

function isKnownUnavailableOffer(url: string): boolean {
  // The host still advertises this Secret Invasion episode, but its resolved
  // CDN target now returns an HTML expiry page instead of media.
  return url === "https://loadedfiles.net/83d24345f30eedfc"
}

function isRealDownloadLink(link: { url: string; text?: string; label?: string }): boolean {
  const copy = `${link.label || ""} ${link.text || ""}`.toLowerCase()
  const host = safeHost(link.url).toLowerCase()
  if (/how to download|fast server|click here|recommended/.test(copy)) return false
  if (host === "associationfoam.com" || host.endsWith(".associationfoam.com")) return false
  return host === "loadedfiles.net" || host.endsWith(".loadedfiles.net")
}

function meaningfulMatch(query: string, title: string): boolean {
  const tokens = query.toLowerCase().match(/[a-z0-9]+/g) || []
  if (!tokens.length) return true
  const haystack = title.toLowerCase()
  return tokens.some((token) => token.length > 1 && haystack.includes(token))
}

function cleanDescription(value?: string): string | null {
  const text = value?.replace(/\s+/g, " ").trim()
  if (!text) return null
  return text.replace(/\bVIDEO INFORMATION\b[\s\S]*$/i, "").trim() || null
}

function safeHost(url: string): string {
  try { return new URL(url).hostname } catch { return "external" }
}

function firstMatch(value: string, expression: RegExp): string | null {
  return value.match(expression)?.[1]?.trim() || null
}

function numberMatch(value: string, expression: RegExp): number | null {
  const match = firstMatch(value, expression)
  return match ? Number(match) : null
}
