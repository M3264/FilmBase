"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

export function StreamPlayer({ tmdbId }: { tmdbId: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [source, setSource] = useState<{ url: string; title: string; quality: string } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    fetch("/api/stream", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "movie", tmdbId }) })
      .then(async (response) => { if (!response.ok) throw new Error("No stream available"); return response.json() })
      .then((data) => { if (!cancelled) setSource(data.sources?.[0] ?? null) })
      .catch(() => { if (!cancelled) setError("Streaming is unavailable right now.") })
    return () => { cancelled = true }
  }, [tmdbId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !source) return
    if (video.canPlayType("application/vnd.apple.mpegurl")) { video.src = source.url; return }
    if (!Hls.isSupported()) { setError("This browser cannot play HLS video."); return }
    const hls = new Hls({ enableWorker: true, lowLatencyMode: false })
    hls.loadSource(source.url)
    hls.attachMedia(video)
    hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setError("The stream could not be loaded.") })
    return () => hls.destroy()
  }, [source])

  return <div className="overflow-hidden border border-border bg-black shadow-[4px_4px_0_hsl(var(--border))]">
    {source ? <video ref={videoRef} controls playsInline preload="metadata" className="aspect-video w-full" aria-label="FilmBase stream" /> : <div className="grid aspect-video place-items-center px-6 text-center text-sm text-white/70">{error || "Finding the best stream…"}</div>}
    {source ? <div className="flex items-center justify-between gap-3 border-t border-white/15 px-4 py-3 text-xs text-white/70"><span>{source.title}</span><span>{source.quality}</span></div> : null}
  </div>
}
