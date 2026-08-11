"use client"

import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import { useMemo, useState } from "react"

import type { HomeSection, MovieItem } from "@/lib/api"
import { displayTitle, publicMoviePath } from "@/lib/presentation"
import { publicImageUrl } from "@/lib/presentation-images"

function hrefFor(movie: MovieItem) {
  return movie.path.startsWith("__anime/")
    ? `/anime/${movie.path.slice("__anime/".length)}`
    : `/movie/${publicMoviePath(movie.path)}`
}

function mixedItems(groups: HomeSection[]) {
  const result: MovieItem[] = []
  const seen = new Set<string>()
  const depth = Math.max(...groups.map((group) => group.items.length), 0)

  for (let index = 0; index < depth && result.length < 6; index += 1) {
    for (const group of groups) {
      const item = group.items[index]
      if (!item || seen.has(item.path)) continue
      seen.add(item.path)
      result.push(item)
      if (result.length === 6) break
    }
  }

  return result
}

export function MixedPosterWall({ groups }: { groups: HomeSection[] }) {
  const usable = useMemo(() => groups.filter((group) => group.items.length).slice(0, 6), [groups])
  const [active, setActive] = useState("mix")
  const items = active === "mix"
    ? mixedItems(usable)
    : usable[Number(active)]?.items.slice(0, 6) ?? []

  if (!items.length) return null

  return (
    <section className="club-section" aria-labelledby="mixed-wall-title">
      <div className="club-heading mixed-wall-heading">
        <div>
          <p className="eyebrow text-primary">Poster wall / across the archive</p>
          <h2 id="mixed-wall-title">A little bit of everything.</h2>
        </div>
        <Link href="/discover">Open the archive <span aria-hidden>↗</span></Link>
      </div>

      <nav className="mixed-wall-nav" aria-label="Choose a poster wall shelf">
        <button type="button" className={active === "mix" ? "active" : ""} onClick={() => setActive("mix")} aria-pressed={active === "mix"}>Mixed bag</button>
        {usable.map((group, index) => (
          <button type="button" className={active === String(index) ? "active" : ""} onClick={() => setActive(String(index))} aria-pressed={active === String(index)} key={`${group.title}-${index}`}>
            {displayTitle(group.title)}
          </button>
        ))}
      </nav>

      <div className="club-wall" aria-live="polite">
        {items.map((movie, index) => {
          const image = movie.imageUrl ? publicImageUrl(movie.imageUrl) : null
          const title = displayTitle(movie.title)
          return (
            <Link href={hrefFor(movie)} className="club-sleeve" style={{ "--tilt": `${[-1.6, 1.2, -0.7, 1.8, -1.1, .7][index]}deg` } as CSSProperties} key={`${movie.path}-${index}`}>
              <span className="club-sleeve-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="club-sleeve-art">
                {image ? <Image src={image} alt={title} fill sizes="(max-width: 600px) 48vw, 18vw" className="object-cover" /> : <span>Artwork pending</span>}
              </div>
              <div className="club-sleeve-copy">
                <strong>{title}</strong>
                <span>{movie.categories?.[0] || movie.date || "FilmBase pick"}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
