import type { MetadataRoute } from "next"
import { getUnifiedHomeData } from "@/lib/api"
import { publicMoviePath } from "@/lib/presentation"

const base = "https://filmbase.fun"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/discover", "/discover/latest", "/discover/trending", "/discover/staff-picks", "/discover/a-z", "/anime", "/search", "/help"]
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: path === "" ? "daily" : "weekly", priority: path === "" ? 1 : 0.7 }))
  try {
    const home = await getUnifiedHomeData()
    const titles = [...new Map(home.sections.flatMap((section) => section.items).map((item) => [item.id, item])).values()]
    return [...staticEntries, ...titles.map((title) => {
      const provider = title.providers[0]
      const path = provider?.provider === "ninejarocks" ? `fb-${provider.id}` : provider?.path || title.slug
      return { url: `${base}/movie/${publicMoviePath(path)}`, changeFrequency: "weekly" as const, priority: 0.8 }
    })]
  } catch { return staticEntries }
}
