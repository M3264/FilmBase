"use client"

import Image from "next/image"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowDownRight, Shuffle } from "lucide-react"
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

export function ClubFloor({ sections }: { sections: HomeSection[] }) {
  const usable = useMemo(() => sections.filter((section) => section.items.length), [sections])
  const [room, setRoom] = useState(0)
  const [picked, setPicked] = useState(0)
  const section = usable[room]
  const items = section?.items.slice(0, 8) ?? []
  const active = items[picked] ?? items[0]

  if (!section || !active) return null

  const changeRoom = (index: number) => {
    setRoom(index)
    setPicked(0)
  }

  const surpriseMe = () => {
    const total = usable.reduce((sum, item) => sum + Math.min(item.items.length, 8), 0)
    if (total < 2) return
    const nextRoom = (room + 1 + Math.floor(Math.random() * Math.max(1, usable.length - 1))) % usable.length
    const nextItems = usable[nextRoom].items.slice(0, 8)
    setRoom(nextRoom)
    setPicked(Math.floor(Math.random() * nextItems.length))
  }

  return (
    <section className="club-floor" aria-labelledby="club-floor-title">
      <header className="club-floor-intro">
        <div>
          <p className="eyebrow">The FilmBase counter</p>
          <h2 id="club-floor-title">Pull a tape. See what happens.</h2>
        </div>
        <button type="button" onClick={surpriseMe}><Shuffle aria-hidden /> Surprise me</button>
      </header>

      <div className="club-floor-desk">
        <nav className="club-crates" aria-label="Browse the video club crates">
          <span className="club-crates-label">Crates</span>
          {usable.map((item, index) => (
            <button
              type="button"
              key={`${item.title}-${index}`}
              className={room === index ? "active" : ""}
              onClick={() => changeRoom(index)}
              aria-pressed={room === index}
            >
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{displayTitle(item.title)}</span>
            </button>
          ))}
        </nav>

        <div className="club-rack" aria-live="polite">
          <div className="club-rack-sign">
            <span>Now digging through</span>
            <strong>{displayTitle(section.title)}</strong>
          </div>
          <div className="club-rack-posters">
            {items.map((movie, index) => {
              const image = imageFor(movie.imageUrl)
              const title = displayTitle(movie.title)
              return (
                <button
                  type="button"
                  className={picked === index ? "active" : ""}
                  onClick={() => setPicked(index)}
                  key={`${movie.path}-${index}`}
                  aria-label={`Pick ${title}`}
                  aria-pressed={picked === index}
                >
                  <span className="club-tape-tab">{String(index + 1).padStart(2, "0")}</span>
                  <span className="club-tape-art">
                    {image ? <Image src={image} alt="" fill sizes="(max-width: 620px) 45vw, 11rem" className="object-cover" /> : <i>Artwork pending</i>}
                  </span>
                  <strong>{title}</strong>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="club-pick" aria-label="Selected title">
          <div className="club-pick-ticket">
            <span>FB rental slip</span>
            <b>#{String(room + 1).padStart(2, "0")}-{String(picked + 1).padStart(2, "0")}</b>
          </div>
          <p className="eyebrow">You pulled</p>
          <h3>{displayTitle(active.title)}</h3>
          <p>{active.summary || "No sales pitch. Just open it, check the details, and decide if it is your kind of night."}</p>
          <dl>
            <div><dt>Filed under</dt><dd>{displayTitle(section.title)}</dd></div>
            <div><dt>Marked</dt><dd>{active.date || active.categories?.[0] || "Club pick"}</dd></div>
          </dl>
          <Link href={hrefFor(active)}>Take it to the player <ArrowDownRight aria-hidden /></Link>
          <small>Picking a poster only changes this slip. Nothing plays without you.</small>
        </aside>
      </div>
    </section>
  )
}
