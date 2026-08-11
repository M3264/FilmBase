import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const ORIGIN = "https://pub-6a6b5d1ffb9940a18a85e615a8302f61.r2.dev/spider-man-brand-new-day-969681-1080p"
const SAFE_FILE = /^(?:index-v2\.m3u8|seg\d{5}\.ts)$/

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const file = (await params).path.join("/")
  if (!SAFE_FILE.test(file)) return new Response("Not found", { status: 404 })

  const upstreamUrl = new URL(`${ORIGIN}/${file}`)
  upstreamUrl.search = request.nextUrl.search
  const upstream = await fetch(upstreamUrl, {
    headers: request.headers.get("range") ? { range: request.headers.get("range")! } : undefined,
    cache: file.endsWith(".m3u8") ? "no-store" : "force-cache",
    signal: AbortSignal.timeout(30_000),
  })
  if (!upstream.ok && upstream.status !== 206) return new Response("Stream unavailable", { status: upstream.status })

  const headers = new Headers()
  for (const key of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  headers.set("Cache-Control", file.endsWith(".m3u8") ? "private, no-store" : "public, max-age=86400, immutable")
  headers.set("X-Content-Type-Options", "nosniff")
  return new Response(upstream.body, { status: upstream.status, headers })
}
