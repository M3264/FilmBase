import { NextRequest } from "next/server"
import { setTimeout as delay } from "node:timers/promises"
import { getTitleOffers } from "@/lib/api"
import { FILMBASE_API_URL } from "@/lib/api-config"
import { directPlaybackSource } from "@/lib/providers/direct-playback"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function failure(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "private, no-store" } })
}

// HEAD must never start a conversion via Next's automatic GET fallback.
export function HEAD() {
  return new Response(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "private, no-store" } })
}

// Only catalogue offers are accepted. Never proxy a client-supplied destination.
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || ""
  const indexText = request.nextUrl.searchParams.get("offer") || ""
  const mode = request.nextUrl.searchParams.get("mode") || "direct"
  const compatible = mode === "compatible"
  const session = request.nextUrl.searchParams.get("session") || ""
  const seek = request.nextUrl.searchParams.get("start") || "0"
  if (mode !== "direct" && !compatible) return failure("Invalid playback mode", 400)
  if (compatible && (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(session) || !/^(?:0|[1-9]\d{0,4})(?:\.\d{1,3})?$/.test(seek) || Number(seek) > 86400)) {
    return failure("Invalid compatible playback request", 400)
  }
  if (!path || path.length > 500 || !/^[a-zA-Z0-9][a-zA-Z0-9_./:-]*$/.test(path) || path.includes("://") || path.split("/").includes("..") || !/^\d{1,5}$/.test(indexText)) {
    return failure("Invalid playback request", 400)
  }
  const range = compatible ? null : request.headers.get("range")
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range)
    const start = match?.[1] || ""
    const end = match?.[2] || ""
    if (!match || (!start && !end) || (start && !Number.isSafeInteger(Number(start))) || (end && !Number.isSafeInteger(Number(end))) || (!start && Number(end) === 0) || (start && end && Number(end) < Number(start))) {
      return failure("Unsupported byte range", 416)
    }
  }

  let offers
  try { offers = await getTitleOffers(path) }
  catch { return failure("The file source is unavailable. Try downloading instead.", 502) }
  const offer = offers[Number(indexText)]
  if (!offer) return failure("This file is no longer available", 404)
  const source = directPlaybackSource(offer.url)
  if (!source) {
    return failure("This offer does not support direct playback. Use Download file instead.", 415)
  }

  const url = new URL(`${FILMBASE_API_URL}${compatible ? "/api/compatible-file" : "/api/download-file"}`)
  url.searchParams.set("url", source.url.href)
  if (compatible) { url.searchParams.set("session", session); url.searchParams.set("start", seek) }
  const controller = new AbortController()
  const signal = AbortSignal.any([request.signal, controller.signal])
  // Limit connection/header wait, not the duration of a whole movie.
  const timer = setTimeout(() => controller.abort(), 90_000)
  let upstream: Response
  try {
    for (let attempt = 0; ; attempt++) {
      upstream = await fetch(url, { headers: range ? { Range: range } : {}, cache: "no-store", redirect: "error", signal })
      if (!compatible || upstream.status !== 503 || attempt >= 2) break
      await upstream.body?.cancel()
      // A seek can arrive just before its previous FFmpeg process confirms exit.
      await delay(attempt === 0 ? 400 : 1000, undefined, { signal })
    }
  } catch { return failure("The stream could not be reached. Try downloading instead.", 502) }
  finally { clearTimeout(timer) }

  if (compatible && upstream.status === 503) {
    await upstream.body?.cancel()
    const response = failure("The compatible player is busy. Please retry shortly or download the file.", 503)
    response.headers.set("Retry-After", "3")
    return response
  }
  if (upstream.status === 416) {
    const contentRange = upstream.headers.get("content-range")
    await upstream.body?.cancel()
    return new Response(null, { status: 416, headers: { ...(contentRange ? { "Content-Range": contentRange } : {}), "Cache-Control": "private, no-store" } })
  }
  const contentType = upstream.headers.get("content-type") || ""
  if (!upstream.ok || /text\/html|application\/json/i.test(contentType)) {
    await upstream.body?.cancel()
    return failure("The file source is unavailable. Try downloading instead.", 502)
  }
  const headers = new Headers({
    "Content-Type": compatible ? "video/mp4" : source.contentType,
    "Content-Disposition": "inline",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Accel-Buffering": "no",
  })
  for (const key of compatible ? [] : ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(key)
    if (value) headers.set(key, value)
  }
  if (compatible) headers.set("Accept-Ranges", "none")
  return new Response(upstream.body, { status: upstream.status, headers })
}
