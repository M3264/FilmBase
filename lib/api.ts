const BASE_URL = "https://api.filmbase.fun"

// ── MOVIES ────────────────────────────────────────────────────

export interface NavLinks {
  genres: Array<{ name: string; path: string }>
  categories: Array<{
    name: string
    path: string
    subCategories: Array<{ name: string; path: string }>
  }>
  menuPages: Array<{ name: string; path: string }>
}

export interface MovieItem {
  title: string
  path: string
  imageUrl: string
  categories?: string[]
  date?: string | null
  summary?: string
}

export interface HomeSection {
  title: string
  items: MovieItem[]
}

export interface MovieDetails {
  title: string
  path: string
  synopsis: string
  status: string | null
  downloadSize: string
  videoCodecInfo: string | null
  trailerUrl: string
  downloadItems: Array<{
    type: string
    text: string
    intermediateUrl: string
    season?: string
    episode?: string
  }>
  tags: string[]
  relatedMovies: MovieItem[]
}

export interface SearchResult {
  listTitle: string
  currentPage: number
  totalPages: number
  items: MovieItem[]
}

export interface MenuContent {
  sections: HomeSection[]
  nextListPagePath?: string
}

export async function getNavLinks(): Promise<NavLinks> {
  const res = await fetch(`${BASE_URL}/api/navlinks`, { next: { revalidate: 3600 } })
  const data = await res.json()
  return data.data
}

export async function getHomeData(): Promise<HomeSection[]> {
  const res = await fetch(`${BASE_URL}/api/home`, { cache: "no-store" })
  const data = await res.json()
  return data.data.sections
}

export async function searchMovies(query: string, page = 1): Promise<SearchResult> {
  const res = await fetch(`${BASE_URL}/api/search?query=${encodeURIComponent(query)}&page=${page}`, {
    cache: "no-store",
  })
  const data = await res.json()
  return data.data
}

export async function getMovieDetails(path: string): Promise<MovieDetails> {
  const res = await fetch(`${BASE_URL}/api/movie/${encodeURIComponent(path)}`, { cache: "no-store" })
  const data = await res.json()
  return data.data
}

export async function getMenuContent(menuPath: string): Promise<MenuContent> {
  const res = await fetch(`${BASE_URL}/api/menu/${encodeURIComponent(menuPath)}`, { cache: "no-store" })
  const data = await res.json()
  return data
}

export async function getGenreMovies(genre: string, page = 1): Promise<SearchResult> {
  const cleanGenre = genre.replace(/\/$/, "")
  const res = await fetch(`${BASE_URL}/api/list/${cleanGenre}?page=${page}`, {
  cache: "no-store",
})
  const data = await res.json()
  return data.data
}

export async function resolveDownloadLink(intermediateUrl: string): Promise<{
  fileInfo: {
    fileName: string
    fileSize: string
    uploadDate: string
    uploadTime: string
  }
  directLink: string
  success: boolean
}> {
  const res = await fetch(`${BASE_URL}/api/resolve-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intermediateUrl }),
  })
  return await res.json()
}

// ── ANIME ─────────────────────────────────────────────────────

export interface AnimeItem {
  anime_title: string
  snapshot: string
  [key: string]: unknown
}

export interface AnimeAiringResult {
  data: AnimeItem[]
  [key: string]: unknown
}

export interface AnimeHomepage {
  status: string
  data: {
    airing: AnimeAiringResult
  }
}

export interface AnimeSource {
  url: string
  quality: string
  fansub: string
  audio: string
  isM3U8: boolean
  m3u8_url: string
  file_name: string
  headers: Record<string, string>
  downloadUrl: string | null
}

export interface AnimeEpisodeInfo {
  session_id: string
  anime_id: string
  anime_title: string
  episode_number: number
  full_title: string
  episode_title: string
  episode_url: string
}

export interface AnimeSourcesResult {
  sources: AnimeSource[]
  download: unknown[]
  episode_info: AnimeEpisodeInfo
  processedDownloads: unknown[]
}

export async function getAnimeHomepage(proxied = false): Promise<AnimeHomepage> {
  const endpoint = proxied ? "homepage-proxied" : "homepage"
  const res = await fetch(`${BASE_URL}/api/anime/${endpoint}`, { cache: "no-store" })
  return await res.json()
}

export async function getAiringAnime(page = 1, proxied = false): Promise<AnimeAiringResult> {
  const endpoint = proxied ? "airing-proxied" : "airing"
  const res = await fetch(`${BASE_URL}/api/anime/${endpoint}?page=${page}`, { cache: "no-store" })
  return await res.json()
}

export async function searchAnime(query: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/anime/search/${encodeURIComponent(query)}`, { cache: "no-store" })
  return await res.json()
}

export async function getAnimeInfo(animeId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/anime/info/${encodeURIComponent(animeId)}`, { cache: "no-store" })
  return await res.json()
}

export async function getAnimeEpisodes(animeId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/api/anime/episodes/${encodeURIComponent(animeId)}`, { cache: "no-store" })
  return await res.json()
}

export async function getAnimeEpisodeSources(animeId: string, ep: number): Promise<AnimeSourcesResult> {
  const res = await fetch(
    `${BASE_URL}/api/anime/sources/${encodeURIComponent(animeId)}?ep=${ep}`,
    { cache: "no-store" }
  )
  return await res.json()
}

export async function getAnimeDirectUrl(paheUrl: string): Promise<unknown> {
  const res = await fetch(
    `${BASE_URL}/api/anime/direct?paheUrl=${encodeURIComponent(paheUrl)}`,
    { cache: "no-store" }
  )
  return await res.json()
}
