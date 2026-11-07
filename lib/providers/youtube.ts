import yts from "yt-search"

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const cache = new Map<string, { key: string | null; expires: number }>()

const BAD_TITLE = /(review|reaction|explained|breakdown|ending|recap|easter egg|trailer reaction|honest)/i

function cacheKey(title: string, year: number | null): string {
  return `${title.toLowerCase().trim()}::${year ?? ""}`
}

export async function searchYoutubeTrailer(title: string, year: number | null): Promise<string | null> {
  const key = cacheKey(title, year)
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) return hit.key

  let found: string | null = null
  try {
    const query = `${title}${year ? ` ${year}` : ""} official trailer`
    const result = await yts(query)
    const videos = (result.videos || []).filter((video) => video.videoId && !BAD_TITLE.test(video.title || ""))
    if (videos.length) {
      const ranked = [...videos].sort((a, b) => {
        const aTrailer = /trailer/i.test(a.title || "") ? 0 : 1
        const bTrailer = /trailer/i.test(b.title || "") ? 0 : 1
        if (aTrailer !== bTrailer) return aTrailer - bTrailer
        const aOfficial = /official/i.test(`${a.title} ${a.author?.name}`) ? 0 : 1
        const bOfficial = /official/i.test(`${b.title} ${b.author?.name}`) ? 0 : 1
        return aOfficial - bOfficial
      })
      found = ranked[0]?.videoId || null
    }
  } catch {
    found = null
  }

  cache.set(key, { key: found, expires: Date.now() + CACHE_TTL_MS })
  return found
}
