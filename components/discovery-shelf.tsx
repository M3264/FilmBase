import Link from "next/link"
import type { CatalogTitle } from "@/lib/api"
import { catalogToMovieItem } from "@/lib/api"
import { CatalogView } from "@/components/catalog-view"

export function DiscoveryShelf({
  title,
  note,
  items,
  page,
  hasNext,
  basePath,
}: {
  title: string
  note: string
  items: CatalogTitle[]
  page?: number
  hasNext?: boolean
  basePath?: string
}) {
  return (
    <>
      <header className="mb-8 grid gap-7 border-y border-border py-7 md:grid-cols-[minmax(0,1fr)_17rem] md:items-end md:py-10">
        <div className="min-w-0">
          <p className="eyebrow mb-4 text-primary">FilmBase archive room</p>
          <h1 className="break-words text-[clamp(2.8rem,9vw,7rem)] font-black leading-[.84] tracking-[-.065em]">{title}</h1>
        </div>
        <div className="border-l-4 border-primary pl-4">
          <p className="data-type text-[10px] uppercase text-muted-foreground">Shelf note</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{note}</p>
          {page ? <p className="mt-4 data-type text-[10px] uppercase">Ledger page {String(page).padStart(2, "0")}</p> : null}
        </div>
      </header>

      <CatalogView items={items.map(catalogToMovieItem)} />

      {basePath && (page && page > 1 || hasNext) ? (
        <nav className="mt-12 grid border-y border-border sm:grid-cols-2" aria-label="Discovery pages">
          {page && page > 1 ? <Link href={`${basePath}?page=${page - 1}`} className="flex min-h-16 items-center justify-center border-b border-border px-5 text-sm font-semibold hover:bg-secondary sm:justify-start sm:border-b-0 sm:border-r">← Previous crate</Link> : <span />}
          {hasNext ? <Link href={`${basePath}?page=${(page || 1) + 1}`} className="flex min-h-16 items-center justify-center px-5 text-sm font-semibold hover:bg-secondary sm:justify-end">Next crate →</Link> : <span />}
        </nav>
      ) : null}
    </>
  )
}
