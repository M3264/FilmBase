import { NextResponse } from "next/server"

const ALLOWED_HOSTS = new Set(["9jarocks.net", "www.9jarocks.net", "thenkiri.ng", "www.thenkiri.ng"])

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")
  if (!raw) return NextResponse.json({ error: "Missing image URL" }, { status: 400 })
  let target: URL
  try { target = new URL(raw) } catch { return NextResponse.json({ error: "Invalid image URL" }, { status: 400 }) }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname.toLowerCase()) || !target.pathname.startsWith("/wp-content/")) {
    return NextResponse.json({ error: "Image host is not allowed" }, { status: 403 })
  }
  try {
    const response = await fetch(target, { headers: { Referer: "https://9jarocks.net/", "User-Agent": "Mozilla/5.0 FilmBase/1.0" }, next: { revalidate: 86400 } })
    if (!response.ok) return NextResponse.json({ error: "Image unavailable" }, { status: response.status })
    const contentType = response.headers.get("content-type") || "image/jpeg"
    if (!contentType.startsWith("image/")) return NextResponse.json({ error: "Not an image" }, { status: 415 })
    return new NextResponse(await response.arrayBuffer(), { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } })
  } catch { return NextResponse.json({ error: "Image fetch failed" }, { status: 502 }) }
}
