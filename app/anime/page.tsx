"use client"

import { useEffect, useState, useCallback } from "react"
import { getNavLinks, getAiringAnime } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"

const PROXY = "https://api.filmbase.fun/api/anime/image-proxy?url="
const proxyImage = (url?: string) => url ? `${PROXY}${encodeURIComponent(url)}` : null

const PAGES_PER_GROUP = 3

export default function AnimePage() {
  const [navLinks, setNavLinks] = useState<any[]>([])
  const [sections, setSections] = useState<{ page: number; items: any[] }[]>([])
  const [groupStart, setGroupStart] = useState(1)
  const [lastPage, setLastPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getNavLinks().then(setNavLinks).catch(() => {})
  }, [])

  const fetchGroup = useCallback(async (startPage: number) => {
    setLoading(true)
    setSections([])
    try {
      const pages = [startPage, startPage + 1, startPage + 2]
      const results = await Promise.all(
        pages.map((p) => getAiringAnime(p, false).catch(() => null))
      )

      const newSections: { page: number; items: any[] }[] = []

      results.forEach((res, i) => {
        const r = res as any
        if (!r) return

        if (r?.last_page) {
          setLastPage(r.last_page)
        }

        const items: any[] = r?.data ?? []
        if (items.length > 0) {
          newSections.push({ page: pages[i], items })
        }
      })

      setSections(newSections)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroup(groupStart)
  }, [groupStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const canPrev = groupStart > 1
  const canNext = lastPage === null || groupStart + PAGES_PER_GROUP <= lastPage

  return (
    <div className="min-h-screen">
      <Script
        src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js"
        strategy="afterInteractive"
      />
      <Script
        async
        data-cfasync="false"
        src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js"
        strategy="afterInteractive"
      />

      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">🎌 Anime</h1>
          <p className="text-muted-foreground">Currently airing anime</p>
        </div>

        <div className="w-full mb-8">
          <div id="container-aadc53e5aa579316a6819840d149ca4b" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No anime available right now.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {sections.map(({ page, items }) => (
              <section key={page}>
                <h2 className="text-lg font-semibold text-muted-foreground mb-4 border-b border-border pb-2">
                  Page {page}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {items.map((anime: any, index: number) => {
                    const animeId = anime.anime_session ?? anime.anime_id
                    const img = proxyImage(anime.snapshot)
                    return (
                      <Link
                        key={`${animeId}-${index}`}
                        href={`/anime/${encodeURIComponent(animeId)}`}
                        className="group block"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary mb-2">
                          {img ? (
                            <Image
                              src={img}
                              alt={anime.anime_title ?? "Anime"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
        )}

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
      </main>

      <Footer />
    </div>
  )
}
