import {
  CatalogApiError,
  mergeCatalogTitles,
  type CatalogPage,
  type CatalogTitle,
  type HomeFeedSection,
  type Provider,
  type ProviderReference,
  type SourceOffer,
  type UnifiedHomeData,
  type DiscoveryCollectionId,
  type DiscoveryIndex,
} from "@/lib/domain/catalog"
import {
  LEGACY_URL,
  legacyJson,
  legacyOffers,
  normalizeLegacyDetail,
  normalizeLegacyMovie,
  type LegacyDetails,
  type LegacyMovie,
} from "@/lib/providers/legacy"
import {
  ninejaCategory,
  ninejaCategoryPage,
  ninejaCategories,
  ninejaDiscoveryFeed,
  ninejaAlphabetical,
  ninejaDetail,
  ninejaHome,
  ninejaOffers,
  ninejaSearch,
  normalizeNinejaDetail,
  normalizeNinejaMovie,
} from "@/lib/providers/ninejarocks"
import { displayTitle } from "@/lib/presentation"
import { LOCAL_MEDIA_PATH, localOffers, localSpiderTitle } from "@/lib/providers/local-media"

export type {
  CatalogPage,
  CatalogTitle,
  ContentType,
  HomeFeedSection,
  Provider,
  ProviderReference,
  SourceOffer,
  UnifiedHomeData,
  DiscoveryCollectionId,
  DiscoveryIndex,
  PublicCatalogTitle,
  PublicSourceOffer,
} from "@/lib/domain/catalog"
export { CatalogApiError } from "@/lib/domain/catalog"

export interface NavLinks {
  genres: Array<{ name: string; path: string }>
  categories: Array<{ name: string; path: string; subCategories: Array<{ name: string; path: string }> }>
  menuPages: Array<{ name: string; path: string }>
}

export interface MovieItem extends LegacyMovie {}
export interface HomeSection { title: string; items: MovieItem[] }
export interface MovieDetails extends LegacyDetails {}
export interface SearchResult { listTitle: string; currentPage: number; totalPages: number; items: MovieItem[] }
export interface MenuContent { sections: HomeSection[]; nextListPagePath?: string }

const discoveryCollections: DiscoveryIndex["collections"] = [
  { id: "latest", label: "Latest releases" },
  { id: "trending", label: "Trending" },
  { id: "staff-picks", label: "Staff picks" },
]

export async function getDiscoveryIndex(): Promise<DiscoveryIndex> {
  const categories = await ninejaCategories()
  return {
    collections: discoveryCollections,
    categories: categories.map(({ slug, label }) => ({ id: slug, label })),
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  }
}

export async function getDiscoveryCollection(collection: DiscoveryCollectionId): Promise<CatalogPage> {
  const upstream = collection === "staff-picks" ? "staff-pick" : collection
  const items = await enrichNinejaArtwork(mergeCatalogTitles((await ninejaDiscoveryFeed(upstream)).map(normalizeNinejaMovie)), 20)
  return { items, page: 1, pageSize: items.length, total: items.length, hasNext: false }
}

export async function getDiscoveryCategory(category: string, page = 1): Promise<CatalogPage> {
  const categories = await ninejaCategories()
  if (!categories.some(({ slug }) => slug === category)) {
    throw new CatalogApiError("Discovery category was not found", "NOT_FOUND", 404)
  }
  const feed = await ninejaCategoryPage(category, page)
  const items = await enrichNinejaArtwork(mergeCatalogTitles((feed.movies || []).map(normalizeNinejaMovie)), 20)
  return {
    items,
    page: feed.page || page,
    pageSize: items.length,
    total: feed.total ?? null,
    hasNext: feed.has_next || Boolean(feed.total_pages && page < feed.total_pages) || Boolean(feed.total && page * Math.max(1, items.length) < feed.total),
  }
}

export async function getAlphabeticalTitles(letter: string): Promise<CatalogPage> {
  const normalized = letter.trim().toUpperCase()
  if (!/^[A-Z]$/.test(normalized)) throw new CatalogApiError("Letter must be A to Z", "INVALID_ARGUMENT", 400)
  const items = await enrichNinejaArtwork(mergeCatalogTitles((await ninejaAlphabetical(normalized)).map(normalizeNinejaMovie)), 20)
  return { items, page: 1, pageSize: items.length, total: items.length, hasNext: false }
}

export async function getUnifiedHomeData(): Promise<UnifiedHomeData> {
  const [ninejaResult, legacyResult] = await Promise.allSettled([ninejaHome(), getHomeData()])
  const sections: HomeFeedSection[] = []
  const providers: Provider[] = []

  sections.push({ id: "local-premieres", title: "FilmBase premieres", items: [localSpiderTitle] })
  providers.push("local")

  if (ninejaResult.status === "fulfilled") {
    providers.push("ninejarocks")
    ninejaResult.value.forEach((section, index) => {
      const items = mergeCatalogTitles(section.movies.map(normalizeNinejaMovie))
      if (items.length) sections.push({ id: `nineja-${section.name || index}`, title: sectionLabel(section.label, index), items })
    })
  }
  if (legacyResult.status === "fulfilled") {
    providers.push("legacy")
    legacyResult.value.forEach((section, index) => {
      const items = mergeCatalogTitles(section.items.map(normalizeLegacyMovie))
      if (items.length) sections.push({ id: `legacy-${index}`, title: section.title, items })
    })
  }
  if (!sections.length) throw firstRejection(ninejaResult, legacyResult)
  // Do not expand the homepage feed into per-title detail requests. API2 can
  // occasionally be slow while populating its SQLite cache; that old fan-out
  // multiplied one page view into 20+ requests and eventually exhausted the
  // web process. Cards without feed artwork use the normal missing-image state.
  const allItems = sections.flatMap((section) => section.items)
  return {
    sections,
    featured: mergeCatalogTitles(allItems.filter((item) => item.imageUrl)).slice(0, 5).length
      ? mergeCatalogTitles(allItems.filter((item) => item.imageUrl)).slice(0, 5)
      : allItems.slice(0, 5),
    providers,
  }
}

export async function searchCatalog(query: string, page = 1, pageSize = 24): Promise<CatalogPage> {
  const cleanQuery = query.trim()
  if (!cleanQuery) return { items: [], page, pageSize, total: 0, hasNext: false }
  const [legacyResult, ninejaResult] = await Promise.allSettled([searchMoviesLegacy(cleanQuery, page), ninejaSearch(cleanQuery)])
  const legacyItems = legacyResult.status === "fulfilled" ? legacyResult.value.items.map(normalizeLegacyMovie) : []
  const ninejaItems = ninejaResult.status === "fulfilled" ? await enrichNinejaArtwork(ninejaResult.value.map(normalizeNinejaMovie), 20) : []
  if (!legacyItems.length && !ninejaItems.length && legacyResult.status === "rejected" && ninejaResult.status === "rejected") {
    throw firstRejection(legacyResult, ninejaResult)
  }
  const localItems = localSpiderTitle.title.toLowerCase().includes(cleanQuery.toLowerCase()) ? [localSpiderTitle] : []
  const ranked = mergeCatalogTitles([...localItems, ...legacyItems, ...ninejaItems]).sort((a, b) => searchRank(cleanQuery, a.title) - searchRank(cleanQuery, b.title))
  const start = Math.max(0, page - 1) * pageSize
  return { items: ranked.slice(start, start + pageSize), page, pageSize, total: ranked.length, hasNext: start + pageSize < ranked.length }
}

export async function getRelatedCatalogTitles(title: CatalogTitle, limit = 8): Promise<CatalogTitle[]> {
  const queries = title.id === "local:spider-man-brand-new-day-2026"
    ? ["Spider-Man"]
    : [title.title.replace(/\([^)]*\)|\b(?:season|episode|complete|added)\b.*$/gi, " ").trim(), title.genres[0]].filter(Boolean) as string[]
  for (const query of queries) {
    try {
      const result = await searchCatalog(query, 1, Math.max(limit + 4, 12))
      const related = result.items.filter((item) => item.id !== title.id && item.providers.every((provider) => !title.providers.some((current) => current.provider === provider.provider && current.id === provider.id)))
      if (related.length) return related.slice(0, limit)
    } catch { /* use the next bounded related query */ }
  }
  try {
    const fallback = await getDiscoveryCollection(title.type === "series" ? "trending" : "staff-picks")
    return fallback.items.filter((item) => item.id !== title.id).slice(0, limit)
  } catch { return [] }
}

export async function getCatalogTitle(idOrPath: string): Promise<CatalogTitle> {
  if (idOrPath === LOCAL_MEDIA_PATH || idOrPath === localSpiderTitle.id || idOrPath === `fb-${LOCAL_MEDIA_PATH}`) return localSpiderTitle
  const ref = parseReference(idOrPath)
  if (ref.provider === "ninejarocks") return normalizeNinejaDetail(ref.id, await ninejaDetail(ref.id))
  if (ref.provider === "legacy") return normalizeLegacyDetail(await getMovieDetailsLegacy(ref.id))
  const ninejaId = idOrPath.match(/(?:^|-)id(\d+)(?:\.html)?$/)?.[1] || (/^\d+$/.test(idOrPath) ? idOrPath : null)
  if (ninejaId) return normalizeNinejaDetail(ninejaId, await ninejaDetail(ninejaId))
  return normalizeLegacyDetail(await getMovieDetailsLegacy(idOrPath))
}

export async function getTitleOffers(idOrPath: string): Promise<SourceOffer[]> {
  if (idOrPath === LOCAL_MEDIA_PATH || idOrPath === localSpiderTitle.id || idOrPath === `fb-${LOCAL_MEDIA_PATH}`) return localOffers()
  const ref = parseReference(idOrPath)
  if (ref.provider === "ninejarocks") {
    const detail = await ninejaDetail(ref.id)
    return ninejaOffers(ref.id, detail)
  }
  if (ref.provider === "legacy") return legacyOffers(await getMovieDetailsLegacy(ref.id))
  const ninejaId = idOrPath.match(/(?:^|-)id(\d+)(?:\.html)?$/)?.[1] || (/^\d+$/.test(idOrPath) ? idOrPath : null)
  if (ninejaId) return ninejaOffers(ninejaId, await ninejaDetail(ninejaId))
  return legacyOffers(await getMovieDetailsLegacy(idOrPath))
}

export async function getCatalogDetail(idOrPath: string): Promise<{ title: CatalogTitle; offers: SourceOffer[] }> {
  const [title, offers] = await Promise.all([getCatalogTitle(idOrPath), getTitleOffers(idOrPath)])
  return { title, offers }
}

export async function resolveSourceOffer(offer: SourceOffer): Promise<{ url: string; externalHost: string }> {
  if (!/^https?:\/\//i.test(offer.url)) throw new CatalogApiError("Invalid download URL", "INVALID_OFFER", 400, offer.provider)
  if (offer.provider === "legacy" && offer.url.startsWith("https://downloadwella.com/")) {
    const result = await resolveDownloadLink(offer.url)
    if (!result.success || !result.directLink) throw new CatalogApiError("Download link could not be resolved", "RESOLVE_FAILED", 502, "legacy")
    return { url: result.directLink, externalHost: safeHost(result.directLink) }
  }
  return { url: offer.url, externalHost: safeHost(offer.url) }
}

export async function getNavLinks(): Promise<NavLinks> {
  const [legacy, categories] = await Promise.allSettled([
    legacyJson<{ data?: NavLinks }>("/api/navlinks", { next: { revalidate: 3600 } }),
    ninejaCategories(),
  ])
  const value: NavLinks = legacy.status === "fulfilled" && legacy.value.data
    ? legacy.value.data
    : { genres: [], categories: [], menuPages: [] }
  if (categories.status === "fulfilled") {
    const existing = new Set(value.categories.map((category) => category.name.toLowerCase()))
    for (const category of categories.value) {
      if (!existing.has(category.label.toLowerCase())) value.categories.push({ name: category.label, path: `category/${category.slug}/`, subCategories: [] })
    }
  }
  return value
}

export async function getHomeData(): Promise<HomeSection[]> {
  const data = await legacyJson<{ data?: { sections?: HomeSection[] } }>("/api/home", { next: { revalidate: 900 } })
  return data.data?.sections || []
}

export async function searchMovies(query: string, page = 1): Promise<SearchResult> {
  try {
    const catalog = await searchCatalog(query, page)
    return { listTitle: `Search results for ${query}`, currentPage: catalog.page, totalPages: Math.max(1, Math.ceil((catalog.total || 0) / catalog.pageSize)), items: catalog.items.map(catalogToMovieItem) }
  } catch {
    return searchMoviesLegacy(query, page)
  }
}

export async function getMovieDetails(path: string): Promise<MovieDetails> {
  const ref = parseReference(path)
  const ninejaId = ref.provider === "ninejarocks" ? ref.id : path.match(/(?:^|-)id(\d+)(?:\.html)?$/)?.[1]
  if (!ninejaId) return getMovieDetailsLegacy(ref.provider === "legacy" ? ref.id : path)
  const detail = await ninejaDetail(ninejaId)
  return {
    title: displayTitle(detail.title),
    path: `fb-${ninejaId}`,
    synopsis: cleanNinejaSynopsis(detail.description),
    status: null,
    downloadSize: detail.description?.match(/filesize\s*:\s*([^\n\r]+?)(?:duration|cast|download|$)/i)?.[1]?.trim() || "",
    videoCodecInfo: null,
    trailerUrl: "",
    downloadItems: (detail.download_links || [])
      .filter(isRealDownloadLink)
      .map((link) => ({
        type: "download",
        text: cleanDownloadLabel(link.label || link.text || "Download"),
        intermediateUrl: link.url,
      })),
    tags: [],
    relatedMovies: [],
  }
}

export async function getMenuContent(menuPath: string): Promise<MenuContent> {
  return legacyJson(`/api/menu/${encodeURIComponent(menuPath)}`, { next: { revalidate: 900 } })
}

export async function getGenreMovies(genre: string, page = 1): Promise<SearchResult> {
  const cleanGenre = genre.replace(/^\/+|\/+$/g, "").replace(/^category\//, "")
  const [legacy, nineja] = await Promise.allSettled([getGenreMoviesLegacy(genre, page), ninejaCategory(cleanGenre)])
  if (legacy.status === "fulfilled" && legacy.value.items.length) return legacy.value
  if (nineja.status === "fulfilled") {
    const items = await enrichNinejaArtwork(nineja.value.map(normalizeNinejaMovie), 20)
    return { listTitle: cleanGenre.replace(/-/g, " "), currentPage: 1, totalPages: 1, items: items.map(catalogToMovieItem) }
  }
  throw firstRejection(legacy, nineja)
}

export async function resolveDownloadLink(intermediateUrl: string): Promise<{ fileInfo: { fileName: string; fileSize: string; uploadDate: string; uploadTime: string }; directLink: string; success: boolean }> {
  return legacyJson("/api/resolve-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ intermediateUrl }) })
}

async function searchMoviesLegacy(query: string, page = 1): Promise<SearchResult> {
  const data = await legacyJson<{ data?: SearchResult }>(`/api/search?query=${encodeURIComponent(query)}&page=${page}`, { cache: "no-store" })
  return data.data || { listTitle: query, currentPage: page, totalPages: 1, items: [] }
}

async function getMovieDetailsLegacy(path: string): Promise<MovieDetails> {
  const data = await legacyJson<{ data?: MovieDetails }>(`/api/movie/${encodeURIComponent(path)}`, { cache: "no-store" })
  if (!data.data) throw new CatalogApiError("Title was not found", "NOT_FOUND", 404, "legacy")
  return data.data
}

async function getGenreMoviesLegacy(genre: string, page = 1): Promise<SearchResult> {
  const cleanGenre = genre.replace(/\/$/, "")
  const data = await legacyJson<{ data?: SearchResult }>(`/api/list/${cleanGenre}?page=${page}`, { cache: "no-store" })
  return data.data || { listTitle: cleanGenre, currentPage: page, totalPages: 1, items: [] }
}

export function catalogToMovieItem(item: CatalogTitle): MovieItem {
  const primary = item.providers[0]
  return { title: displayTitle(item.title), path: primary.provider === "ninejarocks" ? `fb-${primary.id}` : primary.provider === "local" ? primary.id : primary.path, imageUrl: item.imageUrl || "", categories: item.genres, date: item.date, summary: item.synopsis || undefined }
}

function parseReference(value: string): ProviderReference {
  if (value.startsWith("local:")) return { provider: "local", id: value.slice(6), path: value.slice(6) }
  if (/^fb-\d+$/.test(value)) return { provider: "ninejarocks", id: value.slice(3), path: value }
  if (value.startsWith("ninejarocks:")) return { provider: "ninejarocks", id: value.slice(12), path: value }
  if (value.startsWith("legacy:")) {
    const id = decodeURIComponent(value.slice(7))
    return { provider: "legacy", id, path: id }
  }
  return { provider: "legacy", id: value, path: value }
}

function searchRank(query: string, title: string): number {
  const q = query.toLowerCase().trim()
  const value = title.toLowerCase().trim()
  if (value === q) return 0
  if (value.startsWith(q)) return 1
  if (value.includes(q)) return 2
  return 3
}

function sectionLabel(label: string, index: number): string {
  if (label && !/^tie-block_/i.test(label)) return label
  return ["Latest updates", "Trending now", "Nollywood", "TV series", "Movies", "More to watch"][index] || "More to watch"
}

async function enrichNinejaArtwork(items: CatalogTitle[], limit: number): Promise<CatalogTitle[]> {
  const missing = items.filter((item) => !item.imageUrl).slice(0, limit)
  for (let offset = 0; offset < missing.length; offset += 4) {
    await Promise.all(missing.slice(offset, offset + 4).map(async (item) => {
      const provider = item.providers.find((candidate) => candidate.provider === "ninejarocks")
      if (!provider) return
      try {
        const detail = await ninejaDetail(provider.id)
        const artwork = detail.screenshots?.[0] || detail.thumbnail || null
        if (artwork) { item.imageUrl = artwork; item.backdropUrl = artwork }
      } catch { /* retain the explicit missing-art state */ }
    }))
  }
  return items
}

function isRealDownloadLink(link: { url: string; text?: string; label?: string }): boolean {
  const copy = `${link.label || ""} ${link.text || ""}`.toLowerCase()
  let host = ""
  try { host = new URL(link.url).hostname.toLowerCase() } catch { return false }

  if (/how to download|fast server|click here|recommended/.test(copy)) return false
  if (host === "associationfoam.com" || host.endsWith(".associationfoam.com")) return false
  return host === "loadedfiles.net" || host.endsWith(".loadedfiles.net")
}

function cleanDownloadLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim().replace(/^download\s+/i, "") || "Download"
}

function cleanNinejaSynopsis(value?: string): string {
  if (!value) return ""
  const marker = value.search(/VIDEO\s*INFORMATION|DOWNLOAD\s*LINKS|How\s*to\s*download\s*from\s*this\s*site/i)
  const synopsis = marker >= 0 ? value.slice(0, marker) : value
  return synopsis
    .replace(/^Mp4 Download[\s\S]*?Download\d(?:\.\d)?\(\d+\)/i, "")
    .replace(/\s+/g, " ")
    .trim()
}

function safeHost(url: string): string { try { return new URL(url).hostname } catch { return "external" } }

function firstRejection(...results: PromiseSettledResult<unknown>[]): Error {
  const rejection = results.find((result): result is PromiseRejectedResult => result.status === "rejected")
  return rejection?.reason instanceof Error ? rejection.reason : new CatalogApiError("No FilmBase providers are available", "NO_PROVIDERS")
}

// Anime compatibility API remains backed by the legacy service.
export interface AnimeItem { anime_title: string; snapshot: string; [key: string]: unknown }
export interface AnimeAiringResult { data: AnimeItem[]; [key: string]: unknown }
export interface AnimeHomepage { status: string; data: { airing: AnimeAiringResult } }
export interface AnimeSource { url: string; quality: string; fansub: string; audio: string; isM3U8: boolean; m3u8_url: string; file_name: string; headers: Record<string, string>; downloadUrl: string | null }
export interface AnimeEpisodeInfo { session_id: string; anime_id: string; anime_title: string; episode_number: number; full_title: string; episode_title: string; episode_url: string }
export interface AnimeSourcesResult { sources: AnimeSource[]; download: unknown[]; episode_info: AnimeEpisodeInfo; processedDownloads: unknown[] }
export async function getAnimeHomepage(proxied = false): Promise<AnimeHomepage> { return legacyJson(`/api/anime/${proxied ? "homepage-proxied" : "homepage"}`, { cache: "no-store" }) }
export async function getAiringAnime(page = 1, proxied = false): Promise<AnimeAiringResult> { return legacyJson(`/api/anime/${proxied ? "airing-proxied" : "airing"}?page=${page}`, { cache: "no-store" }) }
export async function searchAnime(query: string): Promise<unknown> { return legacyJson(`/api/anime/search/${encodeURIComponent(query)}`, { cache: "no-store" }) }
export async function getAnimeInfo(animeId: string): Promise<unknown> { return legacyJson(`/api/anime/info/${encodeURIComponent(animeId)}`, { cache: "no-store" }) }
export async function getAnimeEpisodes(animeId: string): Promise<unknown> { return legacyJson(`/api/anime/episodes/${encodeURIComponent(animeId)}`, { cache: "no-store" }) }
export async function getAnimeEpisodeSources(animeId: string, ep: number): Promise<AnimeSourcesResult> { return legacyJson(`/api/anime/sources/${encodeURIComponent(animeId)}?ep=${ep}`, { cache: "no-store" }) }
export async function getAnimeDirectUrl(paheUrl: string): Promise<unknown> { return legacyJson(`/api/anime/direct?paheUrl=${encodeURIComponent(paheUrl)}`, { cache: "no-store" }) }

export const apiOrigins = { legacy: LEGACY_URL }
