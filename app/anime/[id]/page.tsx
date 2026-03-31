import type { Metadata } from "next"
import { getNavLinks, getAnimeInfo, getAnimeEpisodes } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"

const PROXY = "https://api.filmbase.fun/api/anime/image-proxy?url="
const proxyImage = (url?: string) => url ? `${PROXY}${encodeURIComponent(url)}` : null

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const anime = await getAnimeInfo(params.id) as any
    const info = anime?.data ?? anime
    const img = proxyImage(info?.cover ?? info?.poster)
    return {
      title: `${info?.title ?? "Anime"} - FilmBase`,
      description: info?.synopsis?.slice(0, 160) ?? `Watch ${info?.title} on FilmBase`,
      openGraph: {
        title: info?.title ?? "Anime",
        description: info?.synopsis?.slice(0, 160) ?? "",
        images: img ? [{ url: img }] : [],
        type: "video.tv_show",
      },
      twitter: {
        card: "summary_large_image",
        title: info?.title ?? "Anime",
        description: info?.synopsis?.slice(0, 160) ?? "",
        images: img ? [img] : [],
      },
    }
  } catch {
    return { title: "Anime - FilmBase" }
  }
}

export default async function AnimeDetailPage({ params }: { params: { id: string } }) {
  const [navLinks, animeRaw, episodesRaw] = await Promise.all([
    getNavLinks(),
    getAnimeInfo(params.id).catch(() => null),
    getAnimeEpisodes(params.id).catch(() => null),
  ])

  const anime = (animeRaw as any)?.data ?? animeRaw as any
  const episodes: any[] = (episodesRaw as any)?.data ?? (episodesRaw as any)?.episodes ?? []

  if (!anime) {
    return (
      <div className="min-h-screen">
        <Header navLinks={navLinks} />
        <main className="container mx-auto px-4 pt-24 pb-12 text-center">
          <p className="text-muted-foreground">Anime not found.</p>
          <Link href="/anime" className="text-primary hover:underline mt-4 block">Back to Anime</Link>
        </main>
        <Footer />
      </div>
    )
  }

  const coverImg = proxyImage(anime.cover ?? anime.poster)

  return (
    <div className="min-h-screen">
      <Script src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js" strategy="afterInteractive" />
      <Script async data-cfasync="false" src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js" strategy="afterInteractive" />

      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-12">
          {coverImg && (
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-secondary">
              <Image src={coverImg} alt={anime.title ?? "Anime"} fill className="object-cover" priority />
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">{anime.title}</h1>
            {anime.status && <p className="text-sm text-muted-foreground">Status: <span className="text-foreground font-medium">{anime.status}</span></p>}
            {anime.season && <p className="text-sm text-muted-foreground">Season: <span className="text-foreground font-medium">{anime.season}</span></p>}
            {anime.episodes_count && <p className="text-sm text-muted-foreground">Episodes: <span className="text-foreground font-medium">{anime.episodes_count}</span></p>}
            {anime.synopsis && (
              <div>
                <h2 className="text-lg font-semibold mb-1">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>
              </div>
            )}
            <div className="w-full">
              <div id="container-aadc53e5aa579316a6819840d149ca4b" />
            </div>
          </div>
        </div>

        {episodes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep: any, i: number) => (
                <Link
                  key={ep.session ?? i}
                  href={`/anime/${encodeURIComponent(params.id)}/episode/${ep.episode ?? i + 1}`}
                  className="flex items-center justify-center px-4 py-3 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Ep. {ep.episode ?? i + 1}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="w-full mt-12">
          <div id="container-aadc53e5aa579316a6819840d149ca4b-2" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
