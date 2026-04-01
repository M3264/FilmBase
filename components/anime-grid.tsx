"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAiringAnime } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"

const PAGES_PER_GROUP = 3

interface AnimeItem {
  anime_id: number
  anime_session: string
  anime_title: string
  episode: number
  snapshot: string
}

interface Section {
  page: number
  items: AnimeItem[]
}

export function AnimeGrid() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialGroup = Math.max(1, Number(searchParams.get("p")) || 1)

  const [sections, setSections] = useState<Section[]>([])
  const [groupStart, setGroupStart] = useState(initialGroup)
  const [lastPage, setLastPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchGroup = useCallback(async (startPage: number) => {
    setLoading(true)
    setSections([])
    try {
      const pages = [startPage, startPage + 1, startPage + 2]
      const results = await Promise.all(
        pages.map((p) => getAiringAnime(p, false).catch(() => null))
      )

      const newSections: Section[] = []
      let detectedLastPage: number | null = null

      results.forEach((res, i) => {
        const r = res as any
        if (!r) return
        if (r.last_page && detectedLastPage === null) {
          detectedLastPage = r.last_page
        }
        const items: AnimeItem[] = r.data ?? []
        if (items.length > 0) {
          newSections.push({ page: pages[i], items })
        }
      })

      if (detectedLastPage !== null) setLastPage(detectedLastPage)
      setSections(newSections)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroup(groupStart)
  }, [groupStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const navigate = (newStart: number) => {
    setGroupStart(newStart)
    router.push(`/anime?p=${newStart}`, { scroll: true })
  }

  const canPrev = groupStart > 1
  const canNext = lastPage === null || groupStart + PAGES_PER_GROUP <= lastPage

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!loading && sections.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No anime available right now.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-12">
        {sections.map(({ page, items }) => (
          <section key={page}>
            <h2 className="text-lg font-semibold text-muted-foreground mb-4 border-b border-border pb-2">
              Page {page}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((anime, index) => {
                const animeId = anime.anime_session ?? anime.anime_id
                const imgSrc = anime.snapshot
                  ? anime.snapshot.startsWith("/")
                    ? `https://api.filmbase.fun${anime.snapshot}`
                    : `https://api.filmbase.fun/api/anime/image-proxy?url=${encodeURIComponent(anime.snapshot)}`
                  : null

                return (
                  <Link
                    key={`${animeId}-${index}`}
                    href={`/anime/${encodeURIComponent(animeId)}`}
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary mb-2">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={anime.anime_title ?? "Anime"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {anime.anime_title}
                    </p>
                    {anime.episode != null && (
                      <p className="text-xs text-muted-foreground mt-0.5">Ep. {anime.episode}</p>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="flex items-center justify-between mt-12 gap-4">
        <button
          onClick={() => navigate(Math.max(1, groupStart - PAGES_PER_GROUP))}
          disabled={!canPrev || loading}
          className="px-6 py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-muted-foreground">
          Pages {groupStart}–{groupStart + PAGES_PER_GROUP - 1}
          {lastPage ? ` of ${lastPage}` : ""}
        </span>

        <button
          onClick={() => navigate(groupStart + PAGES_PER_GROUP)}
          disabled={!canNext || loading}
          className="px-6 py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </>
  )
}
