import {
  inferContentType,
  latestEpisode,
  titleStatus,
  titleYear,
  type CatalogTitle,
  type SourceOffer,
} from "@/lib/domain/catalog"
import { fetchJson } from "@/lib/providers/http"

export const LEGACY_URL = process.env.FILMBASE_LEGACY_API_URL || "https://api.filmbase.fun"

export interface LegacyMovie {
  title: string
  path: string
  imageUrl: string
  categories?: string[]
  date?: string | null
  summary?: string
}

export interface LegacyDetails {
  title: string
  path: string
  synopsis: string
  status: string | null
  downloadSize: string
  videoCodecInfo: string | null
  trailerUrl: string
  downloadItems: Array<{ type: string; text: string; intermediateUrl: string; season?: string; episode?: string }>
  tags: string[]
  relatedMovies: LegacyMovie[]
}

export async function legacyJson<T>(path: string, init?: RequestInit): Promise<T> {
  return fetchJson<T>(`${LEGACY_URL}${path}`, { ...init, provider: "legacy" })
}

export function normalizeLegacyMovie(movie: LegacyMovie): CatalogTitle {
  const type = inferContentType(movie.title, (movie.categories || []).join(" "))
  return {
    id: `legacy:${encodeURIComponent(movie.path)}`,
    slug: movie.path,
    type,
    title: movie.title.trim(),
    year: titleYear(movie.title),
    imageUrl: movie.imageUrl || null,
    backdropUrl: null,
    synopsis: movie.summary?.trim() || null,
    genres: movie.categories || [],
    countries: [],
    languages: [],
    rating: null,
    runtime: null,
    tmdbId: null,
    tmdbType: null,
    tagline: null,
    cast: [],
    director: null,
    releaseDate: movie.date || null,
    status: titleStatus(movie.title),
    latestEpisode: latestEpisode(movie.title),
    date: movie.date || null,
    providers: [{ provider: "legacy", id: movie.path, path: movie.path }],
  }
}

export function normalizeLegacyDetail(detail: LegacyDetails): CatalogTitle {
  return {
    ...normalizeLegacyMovie({
      title: detail.title,
      path: detail.path,
      imageUrl: "",
      categories: detail.tags,
      summary: detail.synopsis,
    }),
    status: detail.status ? (/complete/i.test(detail.status) ? "complete" : "ongoing") : titleStatus(detail.title),
  }
}

export function legacyOffers(detail: LegacyDetails): SourceOffer[] {
  return detail.downloadItems.map((item, index) => {
    const file = decodeURIComponent(item.intermediateUrl.split("/").pop() || "")
    return {
      id: `legacy:${encodeURIComponent(detail.path)}:${index}`,
      provider: "legacy",
      label: item.text,
      url: item.intermediateUrl,
      season: numberFrom(item.season) ?? numberFrom(file.match(/s(\d+)/i)?.[1]),
      episode: numberFrom(item.episode) ?? numberFrom(file.match(/e(\d+)/i)?.[1]),
      quality: file.match(/\b(2160p|1080p|720p|540p|480p|360p)\b/i)?.[1] || null,
      container: file.match(/\.(mkv|mp4|avi|webm)(?:\.|$)/i)?.[1] || null,
      codec: detail.videoCodecInfo,
      size: detail.downloadSize || null,
      audio: null,
      subtitles: [],
      externalHost: safeHost(item.intermediateUrl),
      lastVerifiedAt: null,
    }
  })
}

function numberFrom(value?: string): number | null {
  const match = value?.match(/\d+/)?.[0]
  return match ? Number(match) : null
}

function safeHost(url: string): string {
  try { return new URL(url).hostname } catch { return "external" }
}
