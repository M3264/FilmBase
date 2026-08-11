import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import type { HomeSection, MovieItem } from "@/lib/api"
import { displayTitle, publicMoviePath } from "@/lib/presentation"
import { publicImageUrl } from "@/lib/presentation-images"

const BASE_URL = "https://api.filmbase.fun"

function imageFor(source?: string) {
  if (!source) return null
  return publicImageUrl(source)
}

function hrefFor(movie: MovieItem) {
  return movie.path.startsWith("__anime/")
    ? `/anime/${movie.path.slice("__anime/".length)}`
    : `/movie/${publicMoviePath(movie.path)}`
}

export function ClubSection({ section, moreLink, mode }: { section: HomeSection; moreLink?: string; mode: "wall" | "schedule" | "strip" }) {
  if (mode === "schedule") return <Schedule section={section} moreLink={moreLink} />
  if (mode === "strip") return <PosterStrip section={section} moreLink={moreLink} />
  return <PosterWall section={section} moreLink={moreLink} />
}

function SectionHead({ title, moreLink, note }: { title: string; moreLink?: string; note: string }) {
  return (
    <div className="club-heading">
      <div>
        <p className="eyebrow text-primary">{note}</p>
        <h2>{title}</h2>
      </div>
      {moreLink && <Link href={moreLink}>Open the crate <span aria-hidden>↗</span></Link>}
    </div>
  )
}

function PosterWall({ section, moreLink }: { section: HomeSection; moreLink?: string }) {
  return (
    <section className="club-section">
      <SectionHead title={section.title} moreLink={moreLink} note="Poster wall / freshly pinned" />
      <div className="club-wall">
        {section.items.slice(0, 6).map((movie, index) => <Sleeve movie={movie} index={index} key={`${movie.path}-${index}`} />)}
      </div>
    </section>
  )
}

function Sleeve({ movie, index }: { movie: MovieItem; index: number }) {
  const image = imageFor(movie.imageUrl)
  const title = displayTitle(movie.title)
  return (
    <Link href={hrefFor(movie)} className="club-sleeve" style={{ "--tilt": `${[-1.6, 1.2, -0.7, 1.8, -1.1, .7][index % 6]}deg` } as CSSProperties}>
      <span className="club-sleeve-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="club-sleeve-art">
        {image ? <Image src={image} alt={title} fill sizes="(max-width: 600px) 48vw, 18vw" className="object-cover" /> : <span>Artwork pending</span>}
      </div>
      <div className="club-sleeve-copy">
        <strong>{title}</strong>
        <span>{movie.date || movie.categories?.[0] || "FilmBase pick"}</span>
      </div>
    </Link>
  )
}

function Schedule({ section, moreLink }: { section: HomeSection; moreLink?: string }) {
  const [lead, ...rest] = section.items.slice(0, 6)
  if (!lead) return null
  const image = imageFor(lead.imageUrl)
  return (
    <section className="club-section club-schedule-wrap">
      <SectionHead title={section.title} moreLink={moreLink} note="Clerk's shortlist / pick a title" />
      <div className="club-schedule">
        <Link href={hrefFor(lead)} className="club-schedule-lead">
          {image && <Image src={image} alt={displayTitle(lead.title)} fill sizes="(max-width: 800px) 100vw, 52vw" className="object-cover" />}
          <span className="club-on-air">Clerk's pick</span>
          <div><small>Featured from the crate</small><strong>{displayTitle(lead.title)}</strong><span>View title ↗</span></div>
        </Link>
        <div className="club-programme">
          {rest.map((movie, index) => (
            <Link href={hrefFor(movie)} key={movie.path}>
              <time>#{String(index + 2).padStart(2, "0")}</time>
              <span><strong>{displayTitle(movie.title)}</strong><small>{movie.date || movie.categories?.[0] || "Up next"}</small></span>
              <b aria-hidden>→</b>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function PosterStrip({ section, moreLink }: { section: HomeSection; moreLink?: string }) {
  return (
    <section className="club-section club-strip-wrap">
      <SectionHead title={section.title} moreLink={moreLink} note="Pass it around / staff favourites" />
      <div className="club-strip" tabIndex={0} aria-label={`${section.title} horizontal poster shelf`}>
        {section.items.slice(0, 8).map((movie, index) => {
          const image = imageFor(movie.imageUrl)
          return (
            <Link href={hrefFor(movie)} key={`${movie.path}-${index}`} className="club-strip-item">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>{image ? <Image src={image} alt={displayTitle(movie.title)} fill sizes="13rem" className="object-cover" /> : null}</div>
              <strong>{displayTitle(movie.title)}</strong>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
