import { Clapperboard, ExternalLink } from "lucide-react"
import { WrongTrailerButton } from "@/components/wrong-trailer-button"

interface TrailerPreviewProps {
  title: string
  path: string
  year?: number | null
  trailerKey?: string | null
  trailerSource?: "tmdb" | "youtube" | null
}

export function TrailerPreview({ title, path, year, trailerKey, trailerSource }: TrailerPreviewProps) {
  const searchQuery = encodeURIComponent(`${title}${year ? ` ${year}` : ""} official trailer`)
  const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`
  const watchUrl = trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : searchUrl

  return (
    <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="trailer-heading">
      <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-foreground pb-4">
        <div>
          <p className="eyebrow text-primary">Official trailer</p>
          <h2 id="trailer-heading" className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Trailer</h2>
        </div>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 border-b-2 border-foreground pb-1 text-xs font-bold uppercase tracking-[.08em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          YouTube <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
      {trailerKey ? (
        <div className="aspect-video w-full overflow-hidden border border-border bg-black shadow-[4px_4px_0_hsl(var(--border))]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?rel=0`}
            title={`${title} trailer`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="border border-dashed border-border px-6 py-10 text-center">
          <p className="eyebrow text-primary">Preview unavailable</p>
          <h3 className="mt-3 text-2xl font-black">No embedded trailer found for this title.</h3>
          <p className="mt-3 text-sm text-muted-foreground">Search YouTube for the official trailer instead.</p>
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-black uppercase tracking-[.08em] text-primary-foreground hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" /> Search YouTube
          </a>
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Trailer streams from YouTube. {trailerSource === "youtube" ? "Auto-matched by search, may be wrong. " : "FilmBase links the official upload when available. "}
        {trailerKey && trailerSource === "youtube" ? <WrongTrailerButton path={path} title={title} videoId={trailerKey} /> : null}
      </p>
    </section>
  )
}
