import { getNavLinks, getAiringAnime } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"

const PROXY = "https://api.filmbase.fun/api/anime/image-proxy?url="
const proxyImage = (url?: string) => url ? `${PROXY}${encodeURIComponent(url)}` : null

export default async function AnimePage() {
  const [navLinks, animeData] = await Promise.all([
    getNavLinks(),
    getAiringAnime(1, false).catch(() => null),
  ])

  const animeItems: any[] = (animeData as any)?.data ?? []

  return (
    <div className="min-h-screen">
      <Script src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js" strategy="afterInteractive" />
      <Script async data-cfasync="false" src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js" strategy="afterInteractive" />

      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">🎌 Anime</h1>
          <p className="text-muted-foreground">Currently airing anime</p>
        </div>

        <div className="w-full mb-8">
          <div id="container-aadc53e5aa579316a6819840d149ca4b" />
        </div>

        {animeItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {animeItems.map((anime: any, index: number) => {
              const animeId = anime.anime_session ?? anime.anime_id
              const img = proxyImage(anime.snapshot)
              return (
                <Link key={`${animeId}-${index}`} href={`/anime/${encodeURIComponent(animeId)}`} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary mb-2">
                    {img ? (
                      <Image src={img} alt={anime.anime_title ?? "Anime"} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{anime.anime_title}</p>
                  {anime.episode && <p className="text-xs text-muted-foreground mt-0.5">Ep. {anime.episode}</p>}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No anime available right now.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
