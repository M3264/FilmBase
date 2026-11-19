"use client"

import { useEffect, useRef, useState } from "react"
import { FastForward, Maximize, Pause, Play, Rewind, RotateCcw } from "lucide-react"

const controlClass = "inline-flex min-h-11 items-center justify-center gap-2 border border-border bg-background px-3 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"

function clock(seconds: number) {
  const value = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor(value % 3600 / 60)
  return `${hours ? `${hours}:${String(minutes).padStart(2, "0")}` : minutes}:${String(value % 60).padStart(2, "0")}`
}

export function OfferPlayer({ url, label, format }: { url: string; label: string; format?: string | null }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const playbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resume = useRef(false)
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [compatible, setCompatible] = useState(false)
  const [session, setSession] = useState("")
  const [offset, setOffset] = useState(0)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [pendingSeek, setPendingSeek] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const activeUrl = compatible ? `${url}&${new URLSearchParams({ mode: "compatible", session, start: String(offset) })}` : url

  function clearPlaybackTimer() {
    if (playbackTimer.current) clearTimeout(playbackTimer.current)
    playbackTimer.current = null
  }

  function watchPlaybackWait() {
    clearPlaybackTimer()
    if (!videoRef.current?.paused) {
      playbackTimer.current = setTimeout(() => setError("Playback is taking too long to load. Retry or use Download file."), 30_000)
    }
  }

  function resetPlayer(continuePlaying: boolean) {
    resume.current = continuePlaying
    setError(""); setReady(false); setPlaying(false); setAttempt(value => value + 1)
  }

  function seekTo(seconds: number) {
    const target = Math.max(0, Math.min(Math.floor(seconds), duration > 0 ? Math.max(0, Math.floor(duration) - 1) : 86400))
    const continuePlaying = !videoRef.current?.paused
    setOffset(target); setPosition(target); setPendingSeek(null)
    resetPlayer(continuePlaying)
  }

  useEffect(() => {
    if (error) return
    const video = videoRef.current
    if (video) video.src = activeUrl
    const timer = setTimeout(() => {
      if (video && video.readyState < (compatible ? 2 : 1)) setError("This file is taking too long to load. Retry or use Download file.")
    }, compatible ? 45_000 : 30_000)
    const event = compatible ? "loadeddata" : "loadedmetadata"
    const loaded = () => clearTimeout(timer)
    video?.addEventListener(event, loaded)
    return () => {
      clearTimeout(timer); clearPlaybackTimer()
      video?.removeEventListener(event, loaded)
      if (video) { video.pause(); video.removeAttribute("src"); video.load() }
    }
  }, [activeUrl, attempt, compatible, error])

  return <div ref={containerRef} className="border-t border-border bg-secondary/30 p-3 sm:p-4 [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-background">
    {!error ? <video
      key={attempt}
      ref={videoRef}
      src={activeUrl}
      controls={!compatible}
      playsInline
      preload={compatible ? "auto" : "metadata"}
      aria-label={`Watch ${label}`}
      className="aspect-video w-full bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      onLoadedMetadata={(event) => {
        if (!compatible) {
          const total = event.currentTarget.duration
          if (Number.isFinite(total) && total > 0 && total <= 86400) setDuration(total)
          setReady(true)
        }
      }}
      onLoadedData={(event) => {
        const video = event.currentTarget
        if (!video.videoWidth || !video.videoHeight) {
          setError("This browser can read the file but cannot display its video. Try compatible streaming or use Download file.")
        } else {
          setReady(true); video.volume = volume
          if (resume.current) { resume.current = false; video.play().catch(() => setPlaying(false)) }
        }
      }}
      onTimeUpdate={(event) => setPosition(offset + event.currentTarget.currentTime)}
      onPlay={(event) => {
        setPlaying(true)
        document.querySelectorAll("video").forEach(video => { if (video !== event.currentTarget) video.pause() })
        if (event.currentTarget.readyState < 2) watchPlaybackWait()
      }}
      onWaiting={watchPlaybackWait}
      onPlaying={clearPlaybackTimer}
      onPause={() => { setPlaying(false); clearPlaybackTimer() }}
      onEnded={() => setPlaying(false)}
      onError={() => setError(compatible ? "The compatible stream could not start. The single conversion worker may be busy, or the source is unavailable. Retry shortly or use Download file." : "This browser could not play the original file, or the source is unavailable. Try compatible streaming or use Download file.")}
    /> : null}

    {compatible && !error ? <div className="space-y-3 border border-t-0 border-border bg-background p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={controlClass} aria-label={playing ? "Pause stream" : "Play stream"} onClick={() => {
          const video = videoRef.current
          if (!video) return
          if (video.paused) video.play().catch(() => setError("Playback could not start. Retry or use Download file."))
          else video.pause()
        }}>{playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}{playing ? "Pause" : "Play"}</button>
        <button type="button" className={controlClass} aria-label="Back 30 seconds" disabled={position <= 0} onClick={() => seekTo(position - 30)}><Rewind className="h-4 w-4" aria-hidden="true" /><span>30s</span></button>
        <button type="button" className={controlClass} aria-label="Forward 30 seconds" disabled={duration > 0 && position >= duration - 1} onClick={() => seekTo(position + 30)}><span>30s</span><FastForward className="h-4 w-4" aria-hidden="true" /></button>
        <button type="button" className={controlClass} aria-label="Fullscreen" onClick={() => { containerRef.current?.requestFullscreen?.().catch(() => {}) }}><Maximize className="h-4 w-4" aria-hidden="true" /></button>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{clock(position)}{duration > 0 ? ` / ${clock(duration)}` : ""}</span>
      </div>
      {duration > 0 ? <div className="flex items-center gap-3">
        <label className="min-w-0 flex-1 text-xs font-semibold">Jump to {clock(pendingSeek ?? position)}
          <input aria-label="Playback position" type="range" min={0} max={Math.floor(duration) - 1} step={1} value={Math.min(Math.floor(duration) - 1, Math.floor(pendingSeek ?? position))} onChange={event => setPendingSeek(Number(event.target.value))} className="mt-2 block min-h-6 w-full accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" />
        </label>
        <button type="button" className={controlClass} disabled={pendingSeek === null} onClick={() => { if (pendingSeek !== null) seekTo(pendingSeek) }}>Seek</button>
      </div> : <div className="flex items-end gap-3">
        <label className="min-w-0 flex-1 text-xs font-semibold">Jump to (minutes)
          <input aria-label="Jump to minutes" type="number" min={0} max={1440} step="any" placeholder="e.g. 10" value={pendingSeek === null ? "" : pendingSeek / 60} onChange={event => { const value = event.currentTarget.valueAsNumber; setPendingSeek(Number.isFinite(value) && value >= 0 && value <= 1440 ? value * 60 : null) }} className="mt-2 min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" />
        </label>
        <button type="button" className={controlClass} disabled={pendingSeek === null} onClick={() => { if (pendingSeek !== null) seekTo(pendingSeek) }}>Seek</button>
      </div>}
      <label className="flex items-center gap-3 text-xs font-semibold">Volume
        <input aria-label="Volume" type="range" min={0} max={1} step={0.05} value={volume} onChange={event => { const value = Number(event.target.value); setVolume(value); if (videoRef.current) videoRef.current.volume = value }} className="min-h-6 w-28 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" />
      </label>
      <p className="text-xs leading-5 text-muted-foreground">Compatible H.264/AAC stream. Seeking restarts conversion at the selected time and may take a few seconds. One conversion is available at a time.</p>
    </div> : null}

    {error ? <div role="alert" className="border border-border bg-background p-4 text-sm">
      <p className="leading-6">{error}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!compatible ? <button type="button" onClick={() => { setSession(crypto.randomUUID()); setCompatible(true); setOffset(0); setPosition(0); resetPlayer(true) }} className={`${controlClass} border-primary bg-primary text-primary-foreground`}><Play className="h-4 w-4" aria-hidden="true" />Play compatible stream</button> : null}
        <button type="button" onClick={() => { if (compatible) setOffset(Math.floor(position)); resetPlayer(compatible) }} className={controlClass}><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Retry playback</button>
      </div>
    </div> : null}
    {!error && !ready ? <p role="status" className="mt-2 text-xs text-muted-foreground">{compatible ? "Preparing a browser-compatible stream…" : "Loading the original file…"}</p> : null}
    <p className="mt-2 text-xs leading-5 text-muted-foreground">{compatible ? "Converted as you watch; no converted movie is saved on the server." : `Original download source${format ? ` · ${format}` : ""}. Playback depends on your browser and the file’s codecs.`} Download remains available above.</p>
  </div>
}
