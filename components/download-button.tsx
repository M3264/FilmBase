"use client"

import { useState } from "react"
import { ArrowUpRight, Check, Download, Loader2, RotateCcw } from "lucide-react"

type PreparedDownload =
  | { success: true; url: string; externalHost: string; fileName?: string; autoDownload?: boolean }
  | { success: false; message: string }

interface DownloadButtonProps {
  text: string
  season?: string
  episode?: string
  index: number
  fileSize?: string
  codec?: string | null
  sourceHost?: string
  prepareDownload: () => Promise<PreparedDownload>
  compact?: boolean
}

function formatDownloadText(text: string, season?: string, episode?: string): string {
  const seasonNum = season?.match(/\d+/)?.[0]
  const episodeNum = episode?.match(/\d+/)?.[0]

  if (seasonNum && episodeNum) {
    return `Season ${seasonNum.padStart(2, "0")} · Episode ${episodeNum.padStart(2, "0")}`
  }
  if (episodeNum) return `Episode ${episodeNum}`
  if (seasonNum) return `Season ${seasonNum}`

  const compactMatch = text.match(/S(\d+)E(\d+)/i)
  if (compactMatch) {
    return `Season ${compactMatch[1].padStart(2, "0")} · Episode ${compactMatch[2].padStart(2, "0")}`
  }

  const longMatch = text.match(/Season\s*(\d+)\s*Episode\s*(\d+)/i)
  if (longMatch) {
    return `Season ${longMatch[1].padStart(2, "0")} · Episode ${longMatch[2].padStart(2, "0")}`
  }

  return text.replace(/^download\s*/i, "").trim() || "Movie file"
}

export function DownloadButton({
  text,
  season,
  episode,
  index,
  fileSize,
  codec,
  sourceHost,
  prepareDownload,
  compact = false,
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [prepared, setPrepared] = useState<Extract<PreparedDownload, { success: true }> | null>(null)
  const [error, setError] = useState("")
  const displayText = formatDownloadText(text, season, episode)
  const offerNumber = String(index + 1).padStart(2, "0")

  async function handlePrepare() {
    setIsLoading(true)
    setError("")
    setPrepared(null)

    try {
      const result = await prepareDownload()
      if (!result.success) {
        setError(result.message)
        return
      }
      setPrepared(result)
      if (result.autoDownload) {
        // A programmatic anchor click preserves the user's gesture while
        // allowing API2 to stream the attachment directly to the browser.
        const anchor = document.createElement("a")
        anchor.href = result.url
        anchor.download = result.fileName || ""
        anchor.rel = "noopener"
        anchor.style.display = "none"
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
      }
    } catch {
      setError("This source could not be prepared. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article className={`border border-border bg-card text-card-foreground transition-[transform,box-shadow] ${compact ? "" : "shadow-[3px_3px_0_hsl(var(--border))] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[5px_5px_0_hsl(var(--border))]"}`}>
      <div className="grid grid-cols-[3.25rem_minmax(0,1fr)] sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
        <div className={`grid place-items-center border-r border-dashed border-border bg-secondary/60 px-2 ${compact ? "py-2.5" : "py-4"}`} aria-hidden="true">
          <span className="font-mono text-sm font-bold tracking-[.14em] text-muted-foreground">{offerNumber}</span>
        </div>

        <div className={`min-w-0 px-4 ${compact ? "py-2.5" : "py-4"} sm:px-5`}>
          <p className="truncate text-sm font-semibold sm:text-base">{displayText}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">
            <span>{sourceHost ? `Download from ${sourceHost}` : "External source"}</span>
            {fileSize ? <span>{fileSize}</span> : null}
            {codec ? <span>{codec}</span> : null}
          </div>
        </div>

        <div className="col-span-2 border-t border-dashed border-border p-2 sm:col-span-1 sm:border-l sm:border-t-0 sm:p-2.5">
          {prepared ? (
            <a
              href={prepared.url}
              download={prepared.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 bg-primary px-4 py-2 text-center text-xs font-bold uppercase tracking-[.1em] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:h-full sm:w-auto"
            >
              {prepared.autoDownload ? "Download again" : <>Open on {prepared.externalHost}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></>}
            </a>
          ) : (
            <button
              type="button"
              onClick={handlePrepare}
              disabled={isLoading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-foreground bg-background px-4 py-2 text-xs font-bold uppercase tracking-[.1em] text-foreground outline-none transition-colors hover:bg-foreground hover:text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-wait disabled:opacity-60 sm:h-full sm:w-auto"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
              {isLoading ? "Starting download" : "Download file"}
            </button>
          )}
        </div>
      </div>

      <div className="sr-only" aria-live="polite">
        {isLoading ? `Preparing ${displayText}` : null}
        {prepared ? (prepared.autoDownload ? `${displayText} download started from ${prepared.externalHost}` : `${displayText} is ready from ${prepared.externalHost}`) : null}
      </div>

      {prepared ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-secondary/40 px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{prepared.autoDownload ? `Download started from ${prepared.externalHost}.` : "Destination verified and ready to open."}</span>
          <button type="button" onClick={() => setPrepared(null)} className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center justify-between gap-3 border-t border-destructive/40 bg-destructive/5 px-4 py-2 text-xs text-destructive" role="alert">
          <span>{error}</span>
          <button type="button" onClick={handlePrepare} className="shrink-0 font-bold underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Try again</button>
        </div>
      ) : null}
    </article>
  )
}
