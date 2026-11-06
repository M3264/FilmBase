"use client"

import { useState } from "react"
import { Clapperboard, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TrailerViewProps {
  title: string
  year?: number | null
  trailerKey?: string | null
}

export function TrailerView({ title, year, trailerKey }: TrailerViewProps) {
  const [open, setOpen] = useState(false)
  const searchQuery = encodeURIComponent(`${title}${year ? ` ${year}` : ""} official trailer`)
  const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`
  const watchUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : searchUrl
  const embedUrl = trailerKey ? `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0` : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 border border-foreground px-4 text-xs font-black uppercase tracking-[.08em] hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
          Trailer
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-foreground p-0">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <p className="eyebrow text-primary">Official trailer</p>
            <DialogTitle className="mt-1 truncate text-base font-black tracking-tight">{title}</DialogTitle>
          </div>
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            YouTube
          </a>
        </div>
        <div className="p-5 pt-4">
          {embedUrl ? (
            <div className="aspect-video w-full overflow-hidden border border-border bg-black">
              {open ? (
                <iframe
                  key={trailerKey}
                  src={embedUrl}
                  title={`${title} trailer`}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : null}
            </div>
          ) : (
            <div className="border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm font-bold">No embedded trailer found for this title.</p>
              <p className="mt-2 text-sm text-muted-foreground">Search YouTube for the official trailer instead.</p>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-black uppercase tracking-[.08em] text-primary-foreground hover:bg-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Search YouTube
              </a>
            </div>
          )}
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Trailer streams from YouTube. FilmBase never hosts trailers, only links the official upload when available.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
