import { NextRequest } from "next/server"

const MEDIA_ORIGIN = process.env.FILMBASE_MEDIA_ORIGIN || "http://127.0.0.1:8006"
const ALLOWED = new Set([
  "spider-man-brand-new-day-2026-filmbase-1080p.mp4",
  "Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4",
])

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const filename = path.join("/")
  if (!ALLOWED.has(filename)) return new Response("Not found", { status: 404 })
  const upstream = await fetch(`${MEDIA_ORIGIN}/${encodeURIComponent(filename)}`, {
    headers: { Range: request.headers.get("range") || "" },
    cache: "no-store",
  })
  if (!upstream.ok && upstream.status !== 206) return new Response("Media unavailable", { status: upstream.status })
  const headers = new Headers()
  for (const key of ["accept-ranges", "content-range", "content-length", "content-type", "etag", "last-modified"]) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  headers.set("Content-Disposition", 'attachment; filename="Spider-Man-Brand-New-Day-2026-1080p-(FilmBase.fun).mp4"')
  headers.set("Cache-Control", "private, no-store")
  return new Response(upstream.body, { status: upstream.status, headers })
}
