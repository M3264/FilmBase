import Link from "next/link"
import Image from "next/image"
import type { CSSProperties } from "react"
import type { MovieItem } from "@/lib/api"
import { displayTitle, publicMoviePath } from "@/lib/presentation"
import { publicImageUrl } from "@/lib/presentation-images"

function normalizeImage(source?: string) {
  if (!source) return null
  return source
}

export function MovieCard({ movie, compact = false, index }: { movie: MovieItem; compact?: boolean; index?: number }) {
  const imageUrl = publicImageUrl(normalizeImage(movie.imageUrl))
  const title = displayTitle(movie.title)
  const href = movie.path.startsWith("__anime/") ? `/anime/${movie.path.slice("__anime/".length)}` : `/movie/${publicMoviePath(movie.path)}`
  const catalogueNumber = String((index ?? 0) + 1).padStart(2, "0")
  const primaryLabel = movie.categories?.[0] || "FilmBase selection"
  const format = movie.type === "series" ? "Series" : movie.type === "anime" ? "Anime" : "Film"
  const detailLine = [format, movie.year || movie.date, movie.rating ? `${movie.rating.toFixed(1)} / 10` : null].filter(Boolean).join(" · ")
  const synopsis = movie.synopsis || movie.summary
  if (compact) return (
    <Link href={href} className="group grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-1 py-3 outline-none transition-colors hover:bg-secondary/60 focus-visible:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:px-3">
      <span className="data-type text-[10px] font-semibold text-primary sm:text-xs">FB/{catalogueNumber}</span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold tracking-[-.01em] group-hover:text-primary sm:text-base">{title}</h3>
        <p className="mt-1 truncate data-type text-[9px] uppercase text-muted-foreground sm:text-[10px]">{detailLine || movie.categories?.slice(0, 2).join(" / ") || "Archive title"}</p>
      </div>
      <span className="eyebrow border-l border-border pl-3 text-muted-foreground transition-colors group-hover:text-foreground">View + download →</span>
    </Link>
  )
  return (
    <Link
      href={href}
      className="catalog-sleeve"
      style={{ "--tilt": `${[-1.4, 1, -.6, 1.5, -.9, .7][(index ?? 0) % 6]}deg` } as CSSProperties}
    >
      <span className="catalog-sleeve-number">{catalogueNumber}</span>
      <div className="catalog-sleeve-art">
        {imageUrl ? <Image src={imageUrl} alt={title} fill className="object-cover" sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 18vw" unoptimized /> : <div className="grid h-full place-items-center p-4 text-center"><span className="data-type text-[10px] uppercase leading-5 text-muted-foreground">FilmBase<br />Artwork pending</span></div>}
      </div>
      <div className="catalog-sleeve-copy">
        <h3>{title}</h3>
        <div>
          <span>{primaryLabel}</span>
          <time>{detailLine || "Title file"}</time>
        </div>
        <p className="catalog-sleeve-meta">{synopsis || "Open the title file for synopsis, artwork, and explicit download offers."}</p>
        <span className="catalog-sleeve-action">View &amp; download <b>↗</b></span>
      </div>
    </Link>
  )
}
