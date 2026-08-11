/**
 * Public, presentation-only ad configuration.
 *
 * Set NEXT_PUBLIC_FILMBASE_ADS to a JSON object keyed by placement, for example:
 *
 * {"footer":{"imageUrl":"https://cdn.example.com/footer.jpg","targetUrl":"https://example.com/offer","alt":"Example sponsor","sponsor":"Example","width":970,"height":90}}
 *
 * This variable is exposed to browsers. Never put provider secrets, private keys,
 * unpublished campaign data, or executable HTML in it.
 */

export const AD_PLACEMENTS = [
  "catalogue-top",
  "catalogue-inline",
  "detail-inline",
  "episode-top",
  "download-after",
  "footer",
] as const

export type AdPlacement = (typeof AD_PLACEMENTS)[number]

export type AdCreative = {
  imageUrl: string
  targetUrl: string
  alt: string
  sponsor?: string
  width: number
  height: number
}

type AdConfiguration = Partial<Record<AdPlacement, AdCreative>>

const DEFAULT_WIDTH = 970
const DEFAULT_HEIGHT = 90
const MIN_DIMENSION = 1
const MAX_DIMENSION = 4096

function isSafePublicUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false

  try {
    const url = new URL(value, "https://filmbase.invalid")
    return url.protocol === "https:" || url.origin === "https://filmbase.invalid"
  } catch {
    return false
  }
}

function dimension(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isInteger(value) && value >= MIN_DIMENSION && value <= MAX_DIMENSION
    ? value
    : fallback
}

function parseCreative(value: unknown): AdCreative | null {
  if (!value || typeof value !== "object") return null

  const candidate = value as Record<string, unknown>
  if (!isSafePublicUrl(candidate.imageUrl) || !isSafePublicUrl(candidate.targetUrl)) return null
  if (typeof candidate.alt !== "string" || candidate.alt.trim().length === 0) return null

  return {
    imageUrl: candidate.imageUrl,
    targetUrl: candidate.targetUrl,
    alt: candidate.alt.trim(),
    sponsor: typeof candidate.sponsor === "string" && candidate.sponsor.trim() ? candidate.sponsor.trim() : undefined,
    width: dimension(candidate.width, DEFAULT_WIDTH),
    height: dimension(candidate.height, DEFAULT_HEIGHT),
  }
}

function readConfiguration(): AdConfiguration {
  const raw = process.env.NEXT_PUBLIC_FILMBASE_ADS
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== "object") return {}

    return Object.fromEntries(
      AD_PLACEMENTS.flatMap((placement) => {
        const creative = parseCreative((parsed as Record<string, unknown>)[placement])
        return creative ? [[placement, creative]] : []
      }),
    ) as AdConfiguration
  } catch {
    return {}
  }
}

const configuration = readConfiguration()

export function getAdCreative(placement: AdPlacement): AdCreative | null {
  return configuration[placement] ?? null
}
