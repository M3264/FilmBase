import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/media/", "/stream-media/"] }, sitemap: "https://filmbase.fun/sitemap.xml", host: "https://filmbase.fun" }
}
