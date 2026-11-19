"use client"

import { useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"

export function OfferPlayer({ url, label, format }: { url: string; label: string; format?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)
  const [attempt, setAttempt] = useState(0)

  function clearPlaybackTimer() {
    if (playbackTimer.current) clearTimeout(playbackTimer.current)
    playbackTimer.current = null
  }

  function watchPlaybackWait() {
    clearPlaybackTimer()
    if (!videoRef.current?.paused) {
      playbackTimer.current = setTimeout(() => {
        setError("Playback is taking too long to load. Retry, choose another file, or use Download file.")
      }, 30_000)
    }
  }

  useEffect(() => {
    if (error) return
    const video = videoRef.current
    if (video) video.src = url
    const timer = setTimeout(() => {
      if (video && video.readyState < 1) setError("This file is taking too long to load. Retry, choose another file, or use Download file.")
    }, 30_000)
    const loaded = () => clearTimeout(timer)
    video?.addEventListener("loadedmetadata", loaded)
    return () => {
      clearTimeout(timer)
      clearPlaybackTimer()
      video?.removeEventListener("loadedmetadata", loaded)
      if (video) { video.pause(); video.removeAttribute("src"); video.load() }
    }
  }, [url, attempt, error])

  return <div className="border-t border-border bg-secondary/30 p-3 sm:p-4">
    {!error ? <video
      key={attempt}
      ref={videoRef}
      src={url}
      controls
      playsInline
      preload="metadata"
      aria-label={`Watch ${label}`}
      className="aspect-video w-full bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      onLoadedMetadata={() => setReady(true)}
      onLoadedData={(event) => {
        if (!event.currentTarget.videoWidth || !event.currentTarget.videoHeight) {
          setError("This browser can read the file but cannot display its video. Use Download file or try another browser.")
        } else setReady(true)
      }}
      onPlay={(event) => {
        document.querySelectorAll("video").forEach(video => { if (video !== event.currentTarget) video.pause() })
        if (event.currentTarget.readyState < 2) watchPlaybackWait()
      }}
      onWaiting={watchPlaybackWait}
      onPlaying={clearPlaybackTimer}
      onPause={clearPlaybackTimer}
      onError={() => setError("This browser could not play the original file, or the source is unavailable. Try another file or use Download file.")}
    /> : null}
    {error ? <div role="alert" className="border border-border bg-background p-4 text-sm">
      <p className="leading-6">{error}</p>
      <button type="button" onClick={() => { setError(""); setReady(false); setAttempt(value => value + 1) }} className="mt-3 inline-flex min-h-11 items-center gap-2 border border-foreground px-4 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry playback
      </button>
    </div> : null}
    {!error && !ready ? <p role="status" className="mt-2 text-xs text-muted-foreground">Loading the original file…</p> : null}
    <p className="mt-2 text-xs leading-5 text-muted-foreground">Original download source{format ? ` · ${format}` : ""}. Playback depends on your browser and the file’s codecs. Download remains available above.</p>
  </div>
}
