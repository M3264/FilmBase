export type Provider = "legacy" | "ninejarocks" | "animepahe" | "local" | "tmdb"

export type ContentType = "movie" | "series" | "anime"

export interface ProviderReference {
  provider: Provider
  id: string
  path: string
}

export interface CatalogTitle {
  id: string
  slug: string
  type: ContentType
  title: string
  year: number | null
  imageUrl: string | null
  backdropUrl: string | null
  synopsis: string | null
  genres: string[]
  countries: string[]
  languages: string[]
  rating: number | null
  runtime: number | null
  tmdbId: number | null
  tmdbType: "movie" | "tv" | null
  status: "ongoing" | "complete" | null
  latestEpisode: string | null
  date: string | null
  providers: ProviderReference[]
}

export interface SourceOffer {
  id: string
  provider: Provider
  label: string
  url: string
  season: number | null
  episode: number | null
  quality: string | null
  container: string | null
  codec: string | null
  size: string | null
  audio: string | null
  subtitles: string[]
  externalHost: string
  lastVerifiedAt: string | null
}

export interface CatalogPage {
  items: CatalogTitle[]
  page: number
  pageSize: number
  total: number | null
  hasNext: boolean
}

export const discoveryCollectionIds = ["latest", "trending", "staff-picks"] as const
export type DiscoveryCollectionId = (typeof discoveryCollectionIds)[number]

export interface DiscoveryCategory {
  id: string
  label: string
}

export interface DiscoveryIndex {
  collections: Array<{ id: DiscoveryCollectionId; label: string }>
  categories: DiscoveryCategory[]
  letters: string[]
}

/** Public catalogue representation. Adapter identity remains server-side. */
export type PublicCatalogTitle = Omit<CatalogTitle, "providers"> & {
  publicPath: string
  sourceCount: number
}

export type PublicSourceOffer = Omit<SourceOffer, "provider">

export interface HomeFeedSection {
  id: string
  title: string
  items: CatalogTitle[]
}

export interface UnifiedHomeData {
  sections: HomeFeedSection[]
  featured: CatalogTitle[]
  providers: Provider[]
}

export class CatalogApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number | null = null,
    public readonly provider: Provider | null = null,
  ) {
    super(message)
    this.name = "CatalogApiError"
  }
}

export function inferContentType(title: string, hint = ""): ContentType {
  const value = `${title} ${hint}`.toLowerCase()
  if (/\banime\b/.test(value)) return "anime"
  if (/\b(season|episode|series|s\d{1,2}\b|tv\s*series|drama)\b/.test(value)) return "series"
  return "movie"
}

export function titleYear(title: string): number | null {
  const years = [...title.matchAll(/\b(19\d{2}|20\d{2})\b/g)]
  return years.length ? Number(years[years.length - 1][1]) : null
}

export function titleStatus(title: string): "ongoing" | "complete" | null {
  if (/\bcomplete(?:d)?\b/i.test(title)) return "complete"
  if (/\b(?:episode|new episode|ongoing)\b/i.test(title)) return "ongoing"
  return null
}

export function latestEpisode(title: string): string | null {
  const match = title.match(/(?:episode|ep\.?|e)\s*(\d+)(?:\s*[-–&]\s*(\d+))?/i)
  if (!match) return null
  return match[2] ? `Episodes ${match[1]}–${match[2]}` : `Episode ${match[1]}`
}

export function canonicalTitleKey(title: CatalogTitle): string {
  const normalized = title.title
    .toLowerCase()
    .replace(/\b(19\d{2}|20\d{2})\b/g, " ")
    .replace(/\b(?:season|episode|complete|added|movie|series|anime|nollywood|korean|drama)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
  return `${title.type}:${normalized}`
}

export function mergeCatalogTitles(items: CatalogTitle[]): CatalogTitle[] {
  const merged: CatalogTitle[] = []
  for (const item of items) {
    const key = canonicalTitleKey(item)
    const index = merged.findIndex((candidate) => {
      if (canonicalTitleKey(candidate) !== key) return false
      return candidate.year === item.year || candidate.year === null || item.year === null
    })
    if (index < 0) {
      merged.push(item)
      continue
    }
    const current = merged[index]
    merged[index] = {
      ...current,
      year: current.year ?? item.year,
      imageUrl: current.imageUrl || item.imageUrl,
      backdropUrl: current.backdropUrl || item.backdropUrl,
      synopsis: richerText(current.synopsis, item.synopsis),
      genres: unique([...current.genres, ...item.genres]),
      countries: unique([...current.countries, ...item.countries]),
      languages: unique([...current.languages, ...item.languages]),
      rating: current.rating ?? item.rating,
      runtime: current.runtime ?? item.runtime,
      tmdbId: current.tmdbId ?? item.tmdbId,
      tmdbType: current.tmdbType ?? item.tmdbType,
      status: current.status ?? item.status,
      latestEpisode: current.latestEpisode ?? item.latestEpisode,
      date: current.date ?? item.date,
      providers: uniqueBy([...current.providers, ...item.providers], (ref) => `${ref.provider}:${ref.id}`),
    }
  }
  return merged
}

export function publicTitle(title: CatalogTitle): PublicCatalogTitle {
  const primary = title.providers[0]
  const publicPath = primary?.provider === "ninejarocks" ? `fb-${primary.id}` : primary?.provider === "local" ? primary.id : primary?.path || title.slug
  const { providers, ...value } = title
  return { ...value, id: publicPath, publicPath, sourceCount: providers.length }
}

export function publicOffer(offer: SourceOffer): PublicSourceOffer {
  const { provider: _provider, ...value } = offer
  return { ...value, id: publicOfferId(offer.id) }
}

function publicOfferId(id: string): string {
  const parts = id.split(":")
  return parts.length > 1 ? `offer-${parts.slice(1).join("-")}` : id
}

function richerText(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return b.length > a.length ? b : a
}

export function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))]
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>()
  return values.filter((value) => {
    const id = key(value)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}
