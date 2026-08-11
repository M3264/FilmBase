import Link from "next/link"
import { getDiscoveryCategory, catalogToMovieItem } from "@/lib/api"
import { CatalogView } from "@/components/catalog-view"

export async function AnimeGrid({ page = 1 }: { page?: number }) {
  const catalogue = await getDiscoveryCategory("anime", page).catch(() => null)
  if (!catalogue?.items.length) return (
    <section className="border border-dashed border-border px-6 py-16 text-center">
      <p className="data-type text-xs uppercase text-primary">No signal</p>
      <h2 className="mt-3 text-3xl font-black">The anime shelf is quiet.</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">The catalogue source is temporarily unavailable. Try again shortly.</p>
      <Link href="/anime" className="mt-6 inline-flex border-2 border-foreground px-5 py-3 text-sm font-semibold hover:bg-foreground hover:text-background">Retune shelf</Link>
    </section>
  )
  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-foreground pb-3">
        <div><p className="eyebrow mb-2 text-primary">Anime arrivals</p><h2 className="text-2xl font-black tracking-[-.04em] sm:text-3xl">Current shelf</h2></div>
        <span className="data-type hidden text-[10px] uppercase text-muted-foreground sm:block">{catalogue.items.length} titles logged</span>
      </div>
      <CatalogView items={catalogue.items.map(catalogToMovieItem)} />
      {(page > 1 || catalogue.hasNext) && <nav className="mt-12 grid border-y border-border sm:grid-cols-2" aria-label="Anime catalogue pages">{page > 1 ? <Link href={`/anime?page=${page - 1}`} className="flex min-h-16 items-center justify-center border-b border-border px-5 text-sm font-semibold hover:bg-secondary sm:justify-start sm:border-b-0 sm:border-r">← Earlier shelf</Link> : <span />}{catalogue.hasNext ? <Link href={`/anime?page=${page + 1}`} className="flex min-h-16 items-center justify-center px-5 text-sm font-semibold hover:bg-secondary sm:justify-end">Next shelf →</Link> : <span />}</nav>}
    </>
  )
}
