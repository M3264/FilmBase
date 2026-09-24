import type { MetadataRoute } from "next"
import { getUnifiedHomeData } from "@/lib/api"
import { publicMoviePath } from "@/lib/presentation"
import moviePathsById from "@/lib/movie-sitemap-paths.json"
import { SITE_URL } from "@/lib/site-url"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/discover", "/discover/latest", "/discover/trending", "/discover/staff-picks", "/discover/a-z", "/anime", "/search", "/help"]
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: `${SITE_URL}${path}` }))
  // The publisher's published title paths also let API2 resolve older IDs.
  const moviePaths = new Set(Object.keys(moviePathsById).map((id) => `fb-${id}`))
  try {
    const home = await getUnifiedHomeData()
    for (const title of [...home.featured, ...home.sections.flatMap((section) => section.items)]) {
      const provider = title.providers[0]
      const path = provider?.provider === "ninejarocks" ? `fb-${provider.id}` : provider?.path || title.slug
      moviePaths.add(publicMoviePath(path))
    }
  } catch { /* The known catalogue remains available if a live provider is down. */ }
  return [...staticEntries, ...[...moviePaths].map((path) => ({ url: `${SITE_URL}/movie/${path}` }))]
}
