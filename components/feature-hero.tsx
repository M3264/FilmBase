"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { MovieItem } from "@/lib/api"
import { displayTitle, publicMoviePath } from "@/lib/presentation"
import { publicImageUrl } from "@/lib/presentation-images"

const BASE_URL = "https://api.filmbase.fun"
const imageFor = (source?: string) => publicImageUrl(source)

export function FeatureHero({ items }: { items: MovieItem[] }) {
  const slides = items.slice(0, 5)
  const [active, setActive] = useState(0)
  useEffect(() => setActive((value) => Math.min(value, Math.max(0, slides.length - 1))), [slides.length])

  if (!slides.length) return null
  const item = slides[active]
  const title = displayTitle(item.title)
  const image = imageFor(item.imageUrl)
  const move = (direction: number) => setActive((active + direction + slides.length) % slides.length)

  return (
    <section className="club-hero">
      {image && <Image src={image} alt="" fill priority className="object-cover object-center opacity-50 md:object-[75%_35%]" sizes="100vw" />}
      <div className="club-hero-wash" />
      <div className="club-hero-grain" />
      {!image && <div className="club-hero-mark" aria-hidden="true"><span>FB</span><b>Archive feature</b></div>}
      <div className="site-shell club-hero-inner">
        <div className="club-hero-copy">
          <p className="club-signal"><span>FB desk</span> Feature {String(active + 1).padStart(2, "0")} <i>hand-picked</i></p>
          <h1 className="max-w-full break-words text-[1.55rem] font-semibold leading-[1.1] tracking-[-.02em] [overflow-wrap:anywhere] min-[360px]:text-[1.8rem] min-[390px]:text-[2rem] sm:max-w-[22ch] sm:text-[2.75rem] md:text-[3.5rem]">{title}</h1>
          <p className="club-hero-summary">{item.summary || "A hand-picked FilmBase feature, ready to explore alongside the newest films, series and anime."}</p>
          <div className="club-hero-actions">
            <Link href={`/movie/${publicMoviePath(item.path)}`}>Enter this title <span>↗</span></Link>
            <Link href="/discover">Try another shelf</Link>
          </div>
        </div>
        <div className="club-channel-bank">
          <span className="eyebrow">Pick a feature</span>
          {slides.map((slide, index) => (
            <button key={slide.path} onClick={() => setActive(index)} className={index === active ? "active" : ""} aria-label={`Show ${displayTitle(slide.title)}`} aria-current={index === active ? "true" : undefined}>
              <b>{String(index + 1).padStart(2, "0")}</b><span>{displayTitle(slide.title)}</span>
            </button>
          ))}
          <div className="club-channel-controls">
            <button onClick={() => move(-1)} aria-label="Previous feature"><ArrowLeft /></button>
            <button onClick={() => move(1)} aria-label="Next feature"><ArrowRight /></button>
          </div>
        </div>
      </div>
    </section>
  )
}
