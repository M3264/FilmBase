import type { Metadata } from "next"
import { getNavLinks, getAnimeEpisodeSources } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Download, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Script from "next/script"

export async function generateMetadata({ params }: { params: { id: string; ep: string } }): Promise<Metadata> {
  return {
    title: `Episode ${params.ep} - FilmBase Anime`,
    description: `Download episode ${params.ep} on FilmBase`,
  }
}

export default async function AnimeEpisodePage({ params }: { params: { id: string; ep: string } }) {
  const epNumber = Number(params.ep)

  const [navLinks, sourcesRaw] = await Promise.all([
    getNavLinks(),
    getAnimeEpisodeSources(params.id, epNumber).catch(() => null),
  ])

  const sources = sourcesRaw?.sources ?? []
  const epInfo = sourcesRaw?.episode_info

  const qualityOrder = ["1080p", "720p", "480p", "360p"]
  const sorted = [...sources].sort(
    (a, b) => qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality)
  )

  return (
    <div className="min-h-screen">
      <Script src="https://pl28996782.profitablecpmratenetwork.com/8b/15/bd/8b15bd93ad7b847fc91e7aeb8cf99c94.js" strategy="afterInteractive" />
      <Script async data-cfasync="false" src="https://pl28996783.profitablecpmratenetwork.com/aadc53e5aa579316a6819840d149ca4b/invoke.js" strategy="afterInteractive" />

      <Header navLinks={navLinks} />

      <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">
        <Link href={`/anime/${encodeURIComponent(params.id)}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to episodes
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            {epInfo?.anime_title ?? "Anime"} — Ep. {epNumber}
          </h1>
          {epInfo?.episode_title && <p className="text-muted-foreground mt-1">{epInfo.episode_title}</p>}
        </div>

        <div className="w-full mb-8">
          <div id="container-aadc53e5aa579316a6819840d149ca4b" />
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold mb-4">Download</h2>
            {sorted.map((source, i) => (
              <a
                key={i}
                href={source.downloadUrl ?? source.url}
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full px-5 py-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {source.quality}{source.fansub ? ` · ${source.fansub}` : ""}
                    </p>
                    {source.file_name && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {source.file_name.replace(/^AnimePahe_/i, "")}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-primary font-medium group-hover:underline shrink-0 ml-4">Download</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-6">No download links available for this episode.</p>
            <Link href={`/anime/${encodeURIComponent(params.id)}`}>
              <Button variant="outline">Back to Episodes</Button>
            </Link>
          </div>
        )}

        <div className="w-full mt-10">
          <div id="container-aadc53e5aa579316a6819840d149ca4b-2" />
        </div>
      </main>

      <Footer />
    </div>
  )
}
