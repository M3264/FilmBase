const BASE_URL = "https://silver-fishstick-y2se.onrender.com"

export interface NavLinks {
  genres: Array<{ name: string; path: string }>
  categories: Array<{ name: string; path: string }>
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
  const res = await fetch(`${BASE_URL}/api/list/${encodeURIComponent(cleanGenre)}/?page=${page}`, { 
    cache: "no-store" 
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