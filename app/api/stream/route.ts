import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const FILMBASE_SOURCE = {
  url: "/stream-media/Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4",
  title: "FilmBase server",
  type: "mp4",
  quality: "1080p",
}

export async function POST(request: NextRequest) {
  let body: { type?: string; tmdbId?: number }
  try { body = await request.json() } catch { return Response.json({ error: "Invalid request" }, { status: 400 }) }
  if (body.type !== "movie" || !Number.isInteger(body.tmdbId) || body.tmdbId !== 969681) {
    return Response.json({ error: "Unsupported title" }, { status: 400 })
  }

  return Response.json({ sources: [FILMBASE_SOURCE], providerVerified: true })
}
