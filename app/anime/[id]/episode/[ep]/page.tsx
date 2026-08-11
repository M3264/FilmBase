import type { Metadata } from "next"
import { getNavLinks, getAnimeEpisodeSources } from "@/lib/api"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowDownToLine, ArrowLeft, ExternalLink } from "lucide-react"
import { AdSlot } from "@/components/ad-slot"

export async function generateMetadata({ params }: { params: Promise<{ id: string; ep: string }> }): Promise<Metadata> {
  const { ep } = await params
  return { title: `Episode ${ep} - FilmBase Anime`, description: `Download anime episode ${ep} from explicit source offers on FilmBase.` }
}

export default async function AnimeEpisodePage({ params }: { params: Promise<{ id: string; ep: string }> }) {
  const { id, ep } = await params
  const episodeNumber = Number(ep)
  const [navLinks, sourcesRaw] = await Promise.all([
    getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] })),
    Number.isFinite(episodeNumber) ? getAnimeEpisodeSources(id, episodeNumber).catch(() => null) : Promise.resolve(null),
  ])
  const sources = sourcesRaw?.sources ?? []
  const episode = sourcesRaw?.episode_info
  const qualityOrder = ["1080p", "720p", "480p", "360p"]
  const sorted = [...sources].sort((a, b) => {
    const aIndex = qualityOrder.indexOf(a.quality)
    const bIndex = qualityOrder.indexOf(b.quality)
    return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex)
  })

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pt-24 pb-14 sm:pt-28">
        <Link href={`/anime/${encodeURIComponent(id)}`} className="mb-7 inline-flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="h-4 w-4" /> Back to episode guide</Link>

        <header className="grid border-y border-border lg:grid-cols-[1fr_15rem]">
          <div className="min-w-0 py-8 lg:pr-10">
            <p className="eyebrow text-primary">FilmBase after-hours / file desk</p>
            <h1 className="display-type mt-4 break-words text-[clamp(3.2rem,11vw,7.5rem)] font-black uppercase leading-[.78] tracking-[-.065em]">{episode?.anime_title ?? "Anime"}</h1>
            <div className="mt-7 flex flex-wrap items-baseline gap-x-5 gap-y-2"><span className="bg-primary px-3 py-2 data-type text-xs font-bold uppercase text-primary-foreground">Episode {Number.isFinite(episodeNumber) ? episodeNumber : ep}</span>{episode?.episode_title && <p className="text-sm font-semibold sm:text-base">{episode.episode_title}</p>}</div>
          </div>
          <div className="grid grid-cols-2 border-t border-border lg:grid-cols-1 lg:border-l lg:border-t-0">
            <div className="p-5"><p className="eyebrow text-muted-foreground">Desk status</p><p className="mt-3 text-sm font-bold">{sorted.length ? `${sorted.length} files ready` : "No files logged"}</p></div>
            <div className="border-l border-border p-5 lg:border-l-0 lg:border-t"><p className="eyebrow text-muted-foreground">Programme</p><p className="mt-3 text-sm font-bold">Anime / TV</p></div>
          </div>
        </header>

        <div className="my-8"><AdSlot placement="episode-top" compact /></div>

        <section className="mx-auto max-w-4xl" aria-labelledby="download-offers">
          <div className="mb-5 border-b-2 border-foreground pb-3">
            <p className="eyebrow mb-2 text-primary">Explicit external offers</p>
            <h2 id="download-offers" className="display-type text-3xl font-black uppercase sm:text-4xl">Choose a file</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Each row opens the listed external download source. Advertisements remain separate from these actions.</p>
          </div>

          {sorted.length > 0 ? <div className="border-l border-t border-border">{sorted.map((source, index) => {
            const href = source.downloadUrl ?? source.url
            return <a key={`${source.quality}-${index}`} href={href} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[3.5rem_1fr_auto] items-center border-b border-r border-border hover:bg-primary hover:text-primary-foreground focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[5rem_1fr_auto]">
              <span className="grid h-full min-h-20 place-items-center border-r border-border data-type text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 px-4 py-4 sm:px-6"><span className="flex flex-wrap items-center gap-2 text-sm font-bold"><ArrowDownToLine className="h-4 w-4 shrink-0" /> {source.quality || "Source file"}{source.fansub ? <span className="font-normal opacity-70">/ {source.fansub}</span> : null}</span>{source.file_name && <span className="mt-2 block truncate data-type text-[9px] uppercase opacity-60">{source.file_name.replace(/^AnimePahe_/i, "")}</span>}</span>
              <span className="flex items-center gap-2 px-4 text-xs font-bold uppercase sm:px-6">Open <ExternalLink className="h-3.5 w-3.5" /></span>
            </a>
          })}</div> : <div className="border border-dashed border-border px-6 py-14 text-center"><p className="eyebrow text-primary">File desk empty</p><h3 className="display-type mt-3 text-3xl font-black uppercase">Nothing ready to collect</h3><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">No download offers are available for this episode right now.</p><Link href={`/anime/${encodeURIComponent(id)}`} className="mt-6 inline-block border border-foreground px-5 py-3 text-sm font-semibold hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Choose another episode</Link></div>}
        </section>
        <div className="mt-12"><AdSlot placement="download-after" /></div>
      </main>
      <Footer />
    </div>
  )
}
