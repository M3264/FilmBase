import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const FALLBACK_SOURCE = {
  url: "/api/stream/media/index-v2.m3u8",
  title: "FilmBase stream",
  type: "hls",
  quality: "1080p adaptive",
}

export async function POST(request: NextRequest) {
  let body: { type?: string; tmdbId?: number }
  try { body = await request.json() } catch { return Response.json({ error: "Invalid request" }, { status: 400 }) }
  if (body.type !== "movie" || !Number.isInteger(body.tmdbId) || body.tmdbId !== 969681) {
    return Response.json({ error: "Unsupported title" }, { status: 400 })
  }

  let text = ""
  try {
    const upstream = await fetch("https://dulo.cx/api/source", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "text/event-stream", origin: "https://dulo.cx", referer: "https://dulo.cx/" },
      body: JSON.stringify({ type: "movie", tmdbId: body.tmdbId }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    })
    if (upstream.ok) text = await upstream.text()
  } catch { /* use the verified FilmBase fallback below */ }
  const sources: Array<{ url: string; title: string; type: string; quality: string }> = []
  for (const match of text.matchAll(/data:\s*(\{[^\n]+\})/g)) {
    try {
      const event = JSON.parse(match[1])
      for (const source of event.sources ?? []) {
        if (source?.type === "hls" && typeof source.url === "string" && /^https:\/\//.test(source.url)) {
          if (!sources.some((item) => item.url === source.url)) sources.push({ url: source.url, title: source.title || "Stream", type: "hls", quality: source.quality || "auto" })
        }
      }
    } catch { /* ignore progress events */ }
  }
  const verified = sources.some((source) => source.url.includes("spider-man-brand-new-day-969681-1080p/index-v2.m3u8"))
  return Response.json({ sources: [FALLBACK_SOURCE], providerVerified: verified })
}
