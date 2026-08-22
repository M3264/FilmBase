import type { Metadata } from "next"
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { Download, ExternalLink, Play } from "lucide-react"
import { getCatalogDetail, getNavLinks, getRelatedCatalogTitles, catalogToMovieItem } from "@/lib/api"
import { displayTitle } from "@/lib/presentation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DownloadButton } from "@/components/download-button"
import { RecentlyViewed } from "@/components/recently-viewed"
import { prepareTitleOffer } from "@/app/movie/actions"
import { publicImageUrl } from "@/lib/presentation-images"
import { MovieCard } from "@/components/movie-card"
import { StreamPlayer } from "@/components/stream-player"
import { JsonLd } from "@/components/json-ld"
import { SeoBreadcrumbs, breadcrumbSchema } from "@/components/seo-breadcrumbs"

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  try {
    const { path } = await params
    const { title } = await getCatalogDetail(path.join("/"))
    const image = publicImageUrl(title.imageUrl)
    const name = displayTitle(title.title)
    return { title: name, description: title.synopsis?.slice(0, 160) || `View verified file offers and details for ${name} on FilmBase.`, alternates: { canonical: `/movie/${path.join("/")}` }, openGraph: { title: name, images: image ? [{ url: image }] : [] } }
  } catch { return { title: "Title file" } }
}

export default async function MoviePage({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const moviePath = path.join("/")
  const [{ title, offers }, navLinks] = await Promise.all([getCatalogDetail(moviePath), getNavLinks().catch(() => ({ genres: [], categories: [], menuPages: [] }))])
  const name = displayTitle(title.title)
  const groupedOffers = groupOffers(offers)
  const repeatedSeriesSize = offers.length > 6
  const hasAdFreeStream = title.id === "local:spider-man-brand-new-day-2026"
  const canonicalUrl = `https://filmbase.fun/movie/${moviePath}`
  const breadcrumbs = [{ name: "Home", href: "/" }, { name: "Discover", href: "/discover" }, { name }]
  const schema = {
    "@context": "https://schema.org",
    "@type": title.type === "movie" ? "Movie" : "TVSeries",
    name,
    url: canonicalUrl,
    ...(title.synopsis ? { description: title.synopsis } : {}),
    ...(publicImageUrl(title.imageUrl) ? { image: publicImageUrl(title.imageUrl) } : {}),
    ...(title.year ? { dateCreated: String(title.year) } : {}),
    ...(title.genres.length ? { genre: title.genres } : {}),
    ...(title.languages.length ? { inLanguage: title.languages } : {}),
    ...(title.countries.length ? { countryOfOrigin: title.countries.map((country) => ({ "@type": "Country", name: country })) } : {}),
  }
  const metadata = [
    title.year && ["Year", title.year],
    title.rating && ["IMDb", `${title.rating.toFixed(1)} / 10`],
    title.runtime && ["Runtime", formatRuntime(title.runtime)],
    title.languages[0] && ["Language", title.languages.join(", ")],
    title.releaseDate && ["Released", formatReleaseDate(title.releaseDate)],
  ].filter(Boolean) as Array<[string, string | number]>

  return (
    <div className="min-h-screen">
      <Header navLinks={navLinks} />
      <main className="site-shell pb-16 pt-24 sm:pt-28">
        <JsonLd data={[breadcrumbSchema(breadcrumbs), schema]} />
        <SeoBreadcrumbs items={breadcrumbs} />
        <RecentlyViewed title={name} path={moviePath} imageUrl={title.imageUrl || undefined} />
        <article className="grid gap-8 border-y border-border py-7 md:grid-cols-[minmax(14rem,23rem)_minmax(0,1fr)] md:gap-12 md:py-10">
          <div>
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[23rem] overflow-hidden border border-border bg-secondary poster-shadow md:mx-0">
              {publicImageUrl(title.imageUrl) ? <Image src={publicImageUrl(title.imageUrl)!} alt={name} fill priority sizes="(max-width:768px) 85vw, 23rem" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center data-type text-xs uppercase text-muted-foreground">Artwork pending</div>}
              <span className="absolute left-0 top-0 bg-primary px-3 py-2 data-type text-[9px] font-bold uppercase text-primary-foreground">Title file</span>
            </div>
            {title.genres.length ? <div className="mt-5 flex flex-wrap gap-2">{title.genres.map(genre => <span key={genre} className="border border-border px-2 py-1 data-type text-[9px] uppercase text-muted-foreground">{genre}</span>)}</div> : null}
          </div>
          <div className="min-w-0 md:pt-3">
            <p className="eyebrow text-primary">FilmBase circulation dossier</p>
            <h1 className="mt-4 max-w-[19ch] break-words text-[clamp(2.35rem,6vw,4.9rem)] font-black leading-[.9] tracking-[-.055em]">{name}</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {hasAdFreeStream ? <a href="#watch-heading" className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-black uppercase tracking-[.08em] text-primary-foreground hover:bg-foreground"><Play className="h-3.5 w-3.5 fill-current" /> Play</a> : null}
              <a href="#offers-heading" className="inline-flex min-h-10 items-center gap-2 border border-foreground px-4 text-xs font-black uppercase tracking-[.08em] hover:bg-foreground hover:text-background"><Download className="h-3.5 w-3.5" /> Download</a>
            </div>
            {metadata.length ? <dl className="mt-5 flex flex-wrap border-l border-t border-border">{metadata.map(([label, value]) => <div key={label} className="min-w-[6.5rem] flex-1 border-b border-r border-border px-3 py-2.5"><dt className="data-type text-[8px] font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</dt><dd className="mt-1 text-xs font-bold capitalize sm:text-sm">{value}</dd></div>)}</dl> : null}
            {title.genres.length ? <p className="mt-3 text-xs font-semibold text-muted-foreground">{title.genres.join(" · ")}</p> : null}
            {title.tagline ? <p className="mt-5 max-w-2xl text-base font-semibold leading-6 text-primary">“{title.tagline}”</p> : null}
            <section className="mt-5 border-y border-border py-4"><h2 className="sr-only">Overview</h2><p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{title.synopsis || "No synopsis has been filed for this title yet."}</p></section>
            {(title.cast.length || title.director) ? <section className="mt-4 border-b border-border pb-4"><div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-sm">{title.director ? <p><span className="data-type mr-2 text-[8px] font-bold uppercase tracking-[.12em] text-primary">Director</span><strong>{title.director}</strong></p> : null}{title.cast.length ? <p className="min-w-0 text-muted-foreground"><span className="data-type mr-2 text-[8px] font-bold uppercase tracking-[.12em] text-primary">Cast</span>{title.cast.slice(0, 4).join(" · ")}</p> : null}</div>{title.cast.length > 4 ? <details className="mt-3 text-xs text-muted-foreground"><summary className="w-fit cursor-pointer font-bold text-foreground underline decoration-border underline-offset-4">Full cast · {title.cast.length}</summary><p className="mt-3 max-w-2xl leading-6">{title.cast.join(" · ")}</p></details> : null}</section> : null}
          </div>
        </article>

        {hasAdFreeStream ? <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="watch-heading">
          <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-foreground pb-4"><div><p className="eyebrow text-primary">FilmBase watch room</p><h2 id="watch-heading" className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Stream this title</h2></div><p className="max-w-sm text-xs leading-5 text-muted-foreground">Adaptive HLS playback. No pop-ups, overlays, or ad interruptions inside the player.</p></div>
          <StreamPlayer tmdbId={969681} />
        </section> : null}

        <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="offers-heading">
          <div className="mb-5 flex flex-col justify-between gap-4 border-b-2 border-foreground pb-4 sm:flex-row sm:items-end"><div><p className="eyebrow text-primary">Explicit external offers</p><h2 id="offers-heading" className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Choose a file</h2></div><p className="max-w-sm text-xs leading-5 text-muted-foreground">FilmBase never disguises an advertisement as a download. Each prepared offer names the external host before you leave.</p></div>
          {offers.length ? <div className="space-y-3">{groupedOffers.map((group, groupIndex) => group.season ? <details key={group.key} open={groupIndex === 0} className="group border border-foreground bg-card"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 bg-secondary px-4 py-3 hover:bg-primary hover:text-primary-foreground"><span><small className="data-type text-[9px] uppercase text-muted-foreground group-open:text-primary">Season crate</small><strong className="mt-1 block text-lg">Season {String(group.season).padStart(2, "0")}</strong></span><span className="flex items-center gap-4"><b className="data-type text-[10px] uppercase">{group.items.length} episodes</b><i className="text-xl not-italic group-open:rotate-45">+</i></span></summary><div className="grid gap-px bg-border p-px md:grid-cols-2">{group.items.map(({ offer, index }) => <DownloadButton compact key={offer.id} index={index} text={offer.label} season={String(group.season)} episode={offer.episode ? String(offer.episode) : undefined} fileSize={repeatedSeriesSize ? undefined : offer.size || undefined} codec={[offer.quality, offer.codec, offer.container].filter(Boolean).join(" · ")} sourceHost={offer.externalHost} prepareDownload={prepareTitleOffer.bind(null, moviePath, index)} />)}</div></details> : <div key={group.key} className="space-y-2">{group.items.map(({ offer, index }) => <DownloadButton key={offer.id} index={index} text={offer.label} fileSize={offer.size || undefined} codec={[offer.quality, offer.codec, offer.container].filter(Boolean).join(" · ")} sourceHost={offer.externalHost} prepareDownload={prepareTitleOffer.bind(null, moviePath, index)} />)}</div>)}</div> : <div className="border border-dashed border-border p-10 text-center"><p className="eyebrow text-primary">Offer tray empty</p><h3 className="mt-3 text-2xl font-black">No verified file is available yet.</h3><p className="mt-3 text-sm text-muted-foreground">Try another title or return later; promotional redirects are intentionally excluded.</p><Link href="/discover" className="mt-6 inline-flex border-2 border-foreground px-5 py-3 text-sm font-bold hover:bg-foreground hover:text-background">Browse another shelf →</Link></div>}
        </section>
        <aside className="mx-auto mt-12 flex max-w-5xl items-start gap-3 border-t border-border pt-5 text-xs leading-5 text-muted-foreground"><ExternalLink className="mt-0.5 h-4 w-4 shrink-0" /><p>External hosts control their own availability and file delivery. Check the filename and size before saving. <Link href="/help#broken-files" className="font-bold text-foreground underline underline-offset-4">Report a broken offer</Link>.</p></aside>
        <Suspense fallback={<RelatedTitlesSkeleton />}>
          <RelatedTitles title={title} hasAdFreeStream={hasAdFreeStream} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

async function RelatedTitles({ title, hasAdFreeStream }: { title: Awaited<ReturnType<typeof getCatalogDetail>>["title"]; hasAdFreeStream: boolean }) {
  const related = await getRelatedCatalogTitles(title, 8).catch(() => [])
  if (!related.length) return null
  return <section className="mt-16 border-t border-border pt-7" aria-labelledby="related-heading"><div className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow text-primary">{hasAdFreeStream ? "The Spider-Man shelf" : "From nearby shelves"}</p><h2 id="related-heading" className="mt-2 text-3xl font-black tracking-[-.045em] sm:text-4xl">{hasAdFreeStream ? "More Spider-Man" : "Related titles"}</h2></div><Link href="/discover" className="border-b-2 border-foreground pb-1 text-xs font-bold uppercase tracking-[.08em]">Browse all ↗</Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{related.map((item, index) => <MovieCard key={item.id} movie={catalogToMovieItem(item)} index={index} />)}</div></section>
}

function RelatedTitlesSkeleton() {
  return <section className="mt-16 border-t border-border pt-7" aria-label="Loading related titles" aria-busy="true"><div className="mb-7"><div className="h-3 w-32 animate-pulse bg-secondary" /><div className="mt-3 h-9 w-52 animate-pulse bg-secondary" /></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index}><div className="aspect-[2/3] animate-pulse bg-secondary" /><div className="mt-3 h-3 w-4/5 animate-pulse bg-secondary" /></div>)}</div></section>
}

function groupOffers(offers: Awaited<ReturnType<typeof getCatalogDetail>>["offers"]) {
  const groups = new Map<string, { key: string; season: number | null; items: Array<{ offer: typeof offers[number]; index: number }> }>()
  offers.forEach((offer, index) => {
    const season = offer.season ?? numberFromLabel(offer.label, /s(?:eason)?\s*0*(\d+)/i)
    const episode = offer.episode ?? numberFromLabel(offer.label, /e(?:pisode)?\s*0*(\d+)/i)
    const normalized = episode === offer.episode ? offer : { ...offer, episode }
    const key = season ? `season-${season}` : "other"
    const group = groups.get(key) ?? { key, season, items: [] }
    group.items.push({ offer: normalized, index })
    groups.set(key, group)
  })
  return [...groups.values()].sort((a, b) => (a.season ?? 999) - (b.season ?? 999))
}

function numberFromLabel(value: string, expression: RegExp): number | null {
  const match = value.match(expression)?.[1]
  return match ? Number(match) : null
}

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return hours ? `${hours}h${remainder ? ` ${remainder}m` : ""}` : `${minutes}m`
}

function formatReleaseDate(value: string): string {
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(parsed)
}
