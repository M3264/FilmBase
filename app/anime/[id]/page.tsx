import type { Metadata } from "next"
import { getNavLinks, getAnimeInfo, getAnimeEpisodes } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Play } from "lucide-react"
import { publicAnimeImageUrl } from "@/lib/presentation-images"

const proxyImage = publicAnimeImageUrl

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const response = await getAnimeInfo(id) as any
    const anime = response?.data ?? response
    const image = proxyImage(anime?.cover ?? anime?.poster)
    return {
      title: `${anime?.title ?? "Anime"} - FilmBase`,
      description: anime?.synopsis?.slice(0, 160) ?? `Explore ${anime?.title} on FilmBase`,
      openGraph: { title: anime?.title ?? "Anime", description: anime?.synopsis?.slice(0, 160) ?? "", images: image ? [{ url: image }] : [], type: "video.tv_show" },
      twitter: { card: "summary_large_image", title: anime?.title ?? "Anime", description: anime?.synopsis?.slice(0, 160) ?? "", images: image ? [image] : [] },
    }
  } catch { return { title: "Anime - FilmBase" } }
}

export default async function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [navLinks, animeRaw, episodesRaw] = await Promise.all([
    getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })),
    getAnimeInfo(id).catch(() => null),
    getAnimeEpisodes(id).catch(() => null),
  ])
  const anime = (animeRaw as any)?.data ?? animeRaw as any
  const episodes: any[] = (episodesRaw as any)?.episodes ?? (episodesRaw as any)?.data ?? []

  if (!anime) return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pt-28 pb-16">
        <section className="mx-auto max-w-2xl border border-dashed border-border px-6 py-16 text-center">
          <p className="eyebrow text-primary">Tape missing</p>
          <h1 className="display-type mt-3 text-4xl font-black uppercase">This series left the shelf</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">The listing may have moved or the catalogue signal is temporarily unavailable.</p>
          <Link href="/anime" className="mt-7 inline-block border border-foreground px-5 py-3 text-sm font-semibold hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Return to anime on air</Link>
        </section>
      </main>
      <Footer />
    </div>
  )

  const coverImg = proxyImage(anime.cover ?? anime.poster)
  const metadata = [anime.status && ["Status", anime.status], anime.season && ["Season", anime.season], anime.episodes_count && ["Episodes", anime.episodes_count]].filter(Boolean) as [string, string | number][]

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pt-24 pb-14 sm:pt-28">
        <Link href="/anime" className="mb-7 inline-flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" /> Back to the broadcast board</Link>

        <article className="grid gap-7 border-y border-border py-7 md:grid-cols-[minmax(220px,320px)_1fr] md:gap-12 md:py-10">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-[320px] overflow-hidden bg-secondary poster-shadow md:mx-0">
            {coverImg ? <Image src={coverImg} alt={`Poster for ${anime.title ?? "anime"}`} fill className="object-cover" sizes="(max-width: 768px) 80vw, 320px" priority unoptimized /> : <div className="grid h-full place-items-center p-8 text-center data-type text-xs uppercase text-muted-foreground">Cover art unavailable</div>}
            <span className="absolute left-0 top-0 bg-primary px-3 py-2 data-type text-[10px] font-bold uppercase text-primary-foreground">FilmBase TV-12</span>
          </div>

          <div className="flex min-w-0 flex-col md:py-3">
            <p className="eyebrow text-primary">Late-night series file / {episodes.length ? `${episodes.length} transmissions` : "Schedule pending"}</p>
            <h1 className="mt-4 break-words text-[clamp(2.8rem,9vw,6.5rem)] font-black leading-[.84] tracking-[-.065em]">{anime.title || "Untitled anime"}</h1>
            {metadata.length > 0 && <dl className="mt-7 grid grid-cols-2 border-y border-border sm:grid-cols-3">{metadata.map(([label, value]) => <div key={label} className="border-r border-border px-3 py-4 first:pl-0 last:border-r-0"><dt className="eyebrow text-muted-foreground">{label}</dt><dd className="mt-2 text-sm font-semibold">{value}</dd></div>)}</dl>}
            {anime.synopsis && <section className="mt-7 grid gap-3 sm:grid-cols-[7rem_1fr]"><h2 className="eyebrow pt-1 text-primary">Case notes</h2><p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{anime.synopsis}</p></section>}
          </div>
        </article>

        <section className="mt-12" aria-labelledby="episode-guide">
          <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-foreground pb-3">
            <div><p className="eyebrow mb-2 text-primary">Transmission log</p><h2 id="episode-guide" className="display-type text-3xl font-black uppercase sm:text-4xl">Episode guide</h2></div>
            <span className="data-type hidden text-[10px] uppercase text-muted-foreground sm:block">Select a tape to find its files</span>
          </div>
          {episodes.length > 0 ? (
            <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {episodes.map((episode: any, index) => {
                const number = episode.number ?? index + 1
                return <Link key={episode.id ?? number} href={`/anime/${encodeURIComponent(id)}/episode/${encodeURIComponent(String(number))}`} className="group min-w-0 border-b border-r border-border p-4 hover:bg-primary hover:text-primary-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"><span className="data-type text-[9px] uppercase opacity-60">Transmission {String(index + 1).padStart(2, "0")}</span><span className="mt-2 flex items-center justify-between gap-2 text-sm font-bold"><span>Episode {number}</span><Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /></span></Link>
              })}
            </div>
          ) : <div className="border border-dashed border-border px-6 py-12 text-center"><p className="text-sm text-muted-foreground">No episodes have been logged for this series yet.</p></div>}
        </section>
      </main>
      <Footer />
    </div>
  )
}
