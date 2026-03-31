"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [sections, setSections] = useState<Section[]>([])
  const [groupStart, setGroupStart] = useState(1)
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

      results.forEach((res, i) => {
        const r = res as any
        if (!r) return

        // Grab last_page once
        if (r.last_page && lastPage === null) {
          setLastPage(r.last_page)
        }

        // Root-level data array: { total, per_page, data: [...] }
        const items: AnimeItem[] = r.data ?? []
        if (items.length > 0) {
          newSections.push({ page: pages[i], items })
        }
      })

      setSections(newSections)
    } finally {
      setLoading(false)
    }
  }, [lastPage])

  useEffect(() => {
    fetchGroup(groupStart)
  }, [groupStart]) // eslint-disable-line react-hooks/exhaustive-deps

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
                // snapshot is already a proxied relative URL from the API
                const imgSrc = anime.snapshot
                  ? anime.snapshot.startsWith("/")
                    ? anime.snapshot
                    : `/api/anime/image-proxy?url=${encodeURIComponent(anime.snapshot)}`
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
          onClick={() => setGroupStart((s) => Math.max(1, s - PAGES_PER_GROUP))}
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
          onClick={() => setGroupStart((s) => s + PAGES_PER_GROUP)}
          disabled={!canNext || loading}
          className="px-6 py-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </>
  )
}
