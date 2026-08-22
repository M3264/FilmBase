import type { CatalogTitle } from "@/lib/domain/catalog"
import { fetchJson } from "@/lib/providers/http"

type TmdbSearchResult = { results?: Array<{ id: number; media_type?: string; title?: string; name?: string; release_date?: string; first_air_date?: string }> }
type TmdbDetails = { id: number; runtime?: number | null; vote_average?: number; genres?: Array<{ name: string }>; overview?: string; tagline?: string; release_date?: string; first_air_date?: string; credits?: { cast?: Array<{ name?: string }>; crew?: Array<{ name?: string; job?: string }> } }

const TOKEN = process.env.TMDB_API_READ_TOKEN
const API_KEY = process.env.TMDB_API_KEY
const BASE = "https://api.themoviedb.org/3"

function headers(): HeadersInit {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : { accept: "application/json" }
}

function query(path: string): string {
  return API_KEY ? `${BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${encodeURIComponent(API_KEY)}` : `${BASE}${path}`
}

export async function enrichWithTmdb(items: CatalogTitle[], limit = 12): Promise<CatalogTitle[]> {
  if (!TOKEN && !API_KEY) return items
  const candidates = items.filter((item) => item.type !== "anime").slice(0, limit)
  await Promise.all(candidates.map(async (item) => {
    try {
      const kind = item.tmdbType || (item.type === "series" ? "tv" : "movie")
      let tmdbId = item.tmdbId
      if (!tmdbId) {
        const search = await fetchJson<TmdbSearchResult>(query(`/search/${kind}?query=${encodeURIComponent(item.title)}&page=1&include_adult=false&language=en-US`), { headers: headers(), next: { revalidate: 86400 }, provider: "tmdb", timeoutMs: 3500 })
        const match = (search.results || []).find((result) => {
          const date = result.release_date || result.first_air_date || ""
          return !item.year || !date || date.startsWith(String(item.year))
        }) || search.results?.[0]
        if (!match) return
        tmdbId = match.id
      }
      const detail = await fetchJson<TmdbDetails>(query(`/${kind}/${tmdbId}?language=en-US&append_to_response=credits`), { headers: headers(), next: { revalidate: 86400 }, provider: "tmdb", timeoutMs: 3500 })
      item.tmdbId = detail.id
      item.tmdbType = kind
      item.runtime = detail.runtime || null
      item.rating = typeof detail.vote_average === "number" && detail.vote_average > 0 ? detail.vote_average : item.rating
      item.tagline = detail.tagline || item.tagline
      item.releaseDate = detail.release_date || detail.first_air_date || item.releaseDate
      item.cast = (detail.credits?.cast || []).map((person) => person.name || "").filter(Boolean).slice(0, 6)
      item.director = detail.credits?.crew?.find((person) => person.job === "Director")?.name || item.director
      if (detail.genres?.length) item.genres = [...new Set([...item.genres, ...detail.genres.map((genre) => genre.name)])].slice(0, 4)
      if (!item.synopsis && detail.overview) item.synopsis = detail.overview
    } catch { /* TMDB is optional enrichment; retain provider data */ }
  }))
  return items
}
